import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { getRaceResults } from '@/api/refereeApi';
import { getHorsesByRace } from '@/api/raceHorseApi';
import type { RaceResultFlat } from '@/types';

function formatOdds(odds?: number) {
  if (odds == null) return '—';
  return `×${Number(odds).toFixed(2)}`;
}

function formatTime(seconds?: number) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatReward(n?: number) {
  if (n == null) return null;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

// Huy chương cho top 3, số thứ hạng thường cho các vị trí còn lại.
const MEDAL_STYLE: Record<number, string> = {
  1: 'bg-gradient-to-br from-[#f6dfa0] to-[#c9992f] text-navy-deep ring-2 ring-gold/40 shadow-md',
  2: 'bg-gradient-to-br from-[#eceef1] to-[#aab0b8] text-navy-deep shadow-sm',
  3: 'bg-gradient-to-br from-[#e6b489] to-[#a8703f] text-white shadow-sm',
};

export default function RaceResultSection({ raceId }: { raceId: number }) {
  const [results, setResults] = useState<RaceResultFlat[]>([]);
  const [oddsByHorseId, setOddsByHorseId] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!raceId) return;
    setLoading(true);
    Promise.all([
      getRaceResults(raceId) as unknown as Promise<RaceResultFlat[]>,
      getHorsesByRace(raceId),
    ])
      .then(([data, entries]) => {
        setResults([...(data ?? [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)));
        setOddsByHorseId(
          new Map((entries ?? []).filter((e) => e.odds != null).map((e) => [e.horseId, e.odds as number])),
        );
      })
      .catch(() => {
        setResults([]);
        setOddsByHorseId(new Map());
      })
      .finally(() => setLoading(false));
  }, [raceId]);

  if (!loading && results.length === 0) return null;

  const hasReward = results.some((r) => r.rewards != null);

  return (
    <section className="border-t border-rim bg-surface-overlay/30">
      {loading ? (
        <div className="py-10 text-center text-sm text-ink-3">Loading results…</div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-5 pt-4 pb-1">
            <Trophy size={12} className="text-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-4">Final Standings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse">
              <thead>
                <tr className="border-b border-rim">
                  <th className="w-14 py-2 pl-5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4">Rank</th>
                  <th className="py-2 pl-3 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4">Horse / Jockey</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-ink-4">Time</th>
                  <th className="py-2 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-ink-4">Odds</th>
                  {hasReward && (
                    <th className="py-2 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-4">Reward</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => {
                  const rank = r.rank ?? 99;
                  const isWinner = rank === 1;
                  const medalCls = MEDAL_STYLE[rank];
                  const rowBg = isWinner
                    ? 'bg-gold/8'
                    : idx % 2 === 0 ? 'bg-surface-raised' : 'bg-transparent';
                  const reward = formatReward(r.rewards);
                  const odds = r.horseId != null ? oddsByHorseId.get(r.horseId) : undefined;

                  return (
                    <tr key={r.id} className={`${rowBg} border-b border-rim/60 last:border-0 transition-colors hover:bg-gold/10`}>
                      {/* Rank */}
                      <td className="py-3 pl-5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            medalCls ?? 'border border-rim text-ink-3'
                          }`}
                        >
                          {rank !== 99 ? rank : '—'}
                        </div>
                      </td>
                      {/* Horse + Jockey */}
                      <td className="py-3 pl-3">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-bold uppercase tracking-wide ${isWinner ? 'text-gold-hi' : 'text-ink'}`}>
                            {r.horseName ?? '—'}
                          </p>
                          {isWinner && <Trophy size={13} className="shrink-0 text-gold" />}
                        </div>
                        <p className="mt-0.5 text-xs text-ink-3">
                          {r.jockeyName ?? '—'}
                          {r.breed && <span className="text-ink-4"> · {r.breed}</span>}
                        </p>
                      </td>
                      {/* Time */}
                      <td className="tnum py-3 px-3 text-center text-sm text-ink-3">
                        {r.completionTimeFormatted ?? formatTime(r.completionTimeSeconds)}
                      </td>
                      {/* Odds */}
                      <td className="tnum py-3 px-3 text-center text-sm font-medium text-ink-2">
                        {formatOdds(odds)}
                      </td>
                      {/* Reward */}
                      {hasReward && (
                        <td className="tnum py-3 pr-5 text-right text-sm font-bold text-gold">
                          {reward ?? '—'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
