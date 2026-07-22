import { useEffect, useState } from 'react';
import { Shield, Flag, Trophy, Percent, Coins } from 'lucide-react';
import { getTrainerStats } from '@/api/trainerApi';
import type { TrainerStats } from '@/types';

const fmtVnd = (n?: number | null) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

// Backend may send win rate as 0..1 or 0..100 — normalize to a percent.
const fmtRate = (r?: number) => {
  if (r == null) return '—';
  const pct = r <= 1 ? r * 100 : r;
  return `${Math.round(pct)}%`;
};

function StatTile({ icon: Icon, label, value, highlight }: { icon: typeof Shield; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2 py-4 text-center">
      <Icon size={15} className={highlight ? 'text-gold' : 'text-ink-4'} />
      <span className={`tnum text-lg font-bold ${highlight ? 'text-gold-hi' : 'text-ink'}`}>{value}</span>
      <span className="text-[9px] uppercase tracking-wider text-ink-4">{label}</span>
    </div>
  );
}

export default function TrainerStatsSection({ trainerId, showRecentRaces = true }: { trainerId: number; showRecentRaces?: boolean }) {
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(false);
    getTrainerStats(trainerId)
      .then((s) => { if (alive) setStats(s); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [trainerId]);

  if (loading) {
    return <div className="h-28 animate-pulse rounded-md border border-rim bg-surface-overlay" />;
  }
  if (error || !stats) {
    return null; // stats are supplementary — fail silently rather than break the page
  }

  const recent = stats.recentHistory ?? [];

  return (
    <div className="space-y-4">
      {/* Career stat tiles */}
      <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
        <div className="border-b border-rim px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Track Record</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-y divide-rim sm:grid-cols-5 sm:divide-y-0">
          <StatTile icon={Shield} label="Horses" value={String(stats.totalHorses ?? 0)} />
          <StatTile icon={Flag} label="Races" value={String(stats.totalRaces ?? 0)} />
          <StatTile icon={Trophy} label="Wins" value={String(stats.totalWins ?? 0)} highlight />
          <StatTile icon={Percent} label="Win rate" value={fmtRate(stats.winRate)} />
          <StatTile icon={Coins} label="Rewards" value={fmtVnd(stats.totalRewards)} highlight />
        </div>
      </div>

      {/* Recent races */}
      {showRecentRaces && recent.length > 0 && (
        <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
          <div className="border-b border-rim px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Recent Races</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['Horse', 'Race', 'Date', 'Rank', 'Rewards'].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {recent.slice(0, 6).map((r) => (
                  <tr key={`${r.raceId}-${r.horseId}`} className="transition-colors hover:bg-surface-overlay/40">
                    <td className="px-5 py-2.5 text-sm font-semibold text-ink">{r.horseName ?? `Horse #${r.horseId}`}</td>
                    <td className="px-5 py-2.5 text-sm text-ink-2">{r.raceName ?? `Race #${r.raceId}`}</td>
                    <td className="tnum px-5 py-2.5 text-sm text-ink-3">{fmtDate(r.startTime)}</td>
                    <td className="px-5 py-2.5">
                      {r.rank != null ? (
                        <span className={`tnum inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                          r.rank === 1 ? 'bg-gold/15 text-gold-hi' : 'bg-surface-overlay text-ink-2'
                        }`}>
                          {r.rank}
                        </span>
                      ) : <span className="text-xs text-ink-4">—</span>}
                    </td>
                    <td className="tnum px-5 py-2.5 text-sm font-semibold text-ink">{r.rewards ? fmtVnd(r.rewards) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
