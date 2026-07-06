import { useState, useEffect } from 'react';
import { getRaceResults } from '@/api/refereeApi';
import type { RaceResultNested } from '@/types';

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

const RANK_STYLE: Record<number, string> = {
  1: 'bg-gold text-on-gold font-bold',
  2: 'bg-surface-overlay text-ink-2 font-bold',
  3: 'bg-surface-overlay text-ink-2 font-bold',
};

export default function RaceResultSection({ raceId }: { raceId: number }) {
  const [results, setResults] = useState<RaceResultNested[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!raceId) return;
    setLoading(true);
    getRaceResults(raceId)
      .then((data) => {
        const typed = data as unknown as RaceResultNested[];
        setResults([...(typed ?? [])].sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99)));
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [raceId]);

  if (!loading && results.length === 0) return null;

  return (
    <section className="border-t-4 border-gold">
      {/* Table */}
      {loading ? (
        <div className="bg-surface-raised py-10 text-center text-sm text-ink-3">Loading results…</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-surface-overlay border-b border-rim">
              <th className="w-12 py-2.5 pl-5 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4">Rank</th>
              <th className="py-2.5 pl-3 text-left text-[10px] font-bold uppercase tracking-wider text-ink-4">Horse / Jockey</th>
              <th className="py-2.5 px-3 text-center text-[10px] font-bold uppercase tracking-wider text-ink-4">Time</th>
              <th className="py-2.5 pr-5 text-right text-[10px] font-bold uppercase tracking-wider text-ink-4">Odds</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, idx) => {
              const rankStyle = RANK_STYLE[r.rank ?? 99] ?? 'bg-surface-overlay text-ink-4';
              const rowBg = idx % 2 === 0 ? 'bg-surface-raised' : 'bg-surface-overlay/40';
              return (
                <tr key={r.id} className={`${rowBg} hover:bg-surface-overlay transition-colors`}>
                  {/* Rank badge */}
                  <td className="py-3.5 pl-5">
                    <div className={`inline-flex h-8 w-8 items-center justify-center text-sm ${rankStyle}`}>
                      {r.rank ?? '—'}
                    </div>
                  </td>
                  {/* Horse + Jockey */}
                  <td className="py-3.5 pl-3">
                    <p className="text-sm font-bold uppercase tracking-wide text-ink">
                      {r.raceHorse?.horse?.horseName ?? '—'}
                    </p>
                    <p className="mt-0.5 text-xs uppercase tracking-wider text-ink-4">
                      {r.raceHorse?.jockey?.user?.fullName ?? '—'}
                    </p>
                  </td>
                  {/* Time */}
                  <td className="tnum py-3.5 px-3 text-center text-sm text-ink-3">
                    {formatTime(r.completionTimeSeconds)}
                  </td>
                  {/* Reward */}
                  <td className="tnum py-3.5 pr-5 text-right text-sm font-bold text-gold">
                    {formatOdds(r.raceHorse?.odds)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
