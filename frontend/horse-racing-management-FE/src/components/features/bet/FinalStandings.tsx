import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useRaceResults } from '@/hooks/useRaceResults';
import { LANE_STYLE, type HorseEntry } from './betHelpers';

/* ── Final Standings ────────────────────────────────────────────
   Rendered under the betting grid once a race is FINISHED. Results are
   joined back to the race entries by horseId so each row carries the same
   info as the runners list above (post position, jockey, owner, trainer). */
export default function FinalStandings({ raceId, entries }: { raceId: number; entries: HorseEntry[] }) {
  const { results, loading } = useRaceResults(raceId);

  const entryByHorseId = useMemo(() => {
    const m = new Map<number, HorseEntry>();
    for (const e of entries) m.set(e.horseId, e);
    return m;
  }, [entries]);

  const cols = 'grid-cols-[2.5rem_2.5rem_1fr_5.5rem_4rem]';

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-2 border-b border-rim bg-surface-overlay/60 px-6 py-3">
        <Trophy size={12} className="text-gold" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-hi">Final Standings</span>
      </div>

      {loading ? (
        <div className="divide-y divide-rim">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`grid ${cols} items-center gap-3 px-6 py-4`}>
              <div className="h-3 w-5 animate-pulse rounded bg-rim" />
              <div className="h-8 w-8 animate-pulse rounded bg-rim" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-2/3 animate-pulse rounded bg-rim" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-overlay" />
              </div>
              <div className="ml-auto h-3 w-12 animate-pulse rounded bg-rim" />
              <div className="ml-auto h-5 w-8 animate-pulse rounded bg-rim" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-ink-3">Official results are not available yet.</p>
      ) : (
        <>
          {/* Table header */}
          <div className={`grid ${cols} gap-3 border-b border-rim bg-surface-raised px-6 py-3`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Pos</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">PP</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Runner</span>
            <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Time</span>
            <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Odds</span>
          </div>

          {/* Result rows */}
          <div className="divide-y divide-rim">
            {results.map(r => {
              const entry = r.horseId != null ? entryByHorseId.get(r.horseId) : undefined;
              const laneStyle = LANE_STYLE[entry?.laneNumber ?? 0];
              const isWinner = r.position === 1;

              return (
                <div key={r.id}
                  className={`grid ${cols} items-center gap-3 px-6 py-4 ${isWinner ? 'bg-gold/[0.06]' : ''}`}>

                  {/* Finish position */}
                  <span className={`tnum text-sm font-bold ${isWinner ? 'text-gold-hi' : r.position > 0 && r.position <= 3 ? 'text-ink' : 'text-ink-4'}`}>
                    {r.position > 0 ? String(r.position).padStart(2, '0') : '—'}
                  </span>

                  {/* Post position */}
                  <div className="flex h-8 w-8 items-center justify-center text-sm font-bold"
                    style={laneStyle
                      ? { backgroundColor: laneStyle.bg, color: laneStyle.color }
                      : { backgroundColor: 'rgba(19,28,21,0.06)', color: 'rgba(19,28,21,0.35)' }}>
                    {entry?.laneNumber ?? '—'}
                  </div>

                  {/* Horse info — mirrors the runners list above */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold uppercase tracking-wide text-ink">{r.horseName}</p>
                      {isWinner && (
                        <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-hi">
                          Winner
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-4">
                      Jockey: <span className="text-ink-3">{r.jockeyName || entry?.jockeyName || 'TBA'}</span>
                    </p>
                    {entry && (entry.ownerName || entry.trainerName) && (
                      <p className="mt-0.5 truncate text-[11px] text-ink-4">
                        {entry.ownerName && <>Owner: <span className="text-ink-3">{entry.ownerName}</span></>}
                        {entry.ownerName && entry.trainerName && <span className="mx-1.5">·</span>}
                        {entry.trainerName && <>Trainer: <span className="text-ink-3">{entry.trainerName}</span></>}
                      </p>
                    )}
                  </div>

                  {/* Completion time */}
                  <span className="tnum text-right text-sm font-medium text-ink-2">{r.time ?? '—'}</span>

                  {/* Odds */}
                  <span className="tnum text-right text-sm font-bold text-gold-hi">{r.odds ?? entry?.odds ?? '—'}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
