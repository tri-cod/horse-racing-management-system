import { useState, useMemo, useEffect } from 'react';
import { Flag, MapPin, Trophy, Clock, TrendingUp } from 'lucide-react';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { assignLanes } from '@/utils/laneUtils';
import {
  LANE_STYLE, isRunnerEntry, fmtDate, fmtTime, fmtVnd, fmtPrize,
  type BetAmounts, type HorseEntry,
} from './betHelpers';

/* ── Odds Board ─────────────────────────────────────────────────
   Left panel: race banner + meta + runners table with inline stake input */

/* Skeleton mirrors the loaded layout (banner + meta strip + runner rows)
   instead of a generic spinner, so the panel doesn't jump on load. */
function OddsBoardSkeleton({ showStake }: { showStake: boolean }) {
  const cols = showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]';
  return (
    <div className="flex flex-col">
      <div className="h-48 animate-pulse bg-surface-overlay" />
      <div className="flex gap-5 border-b border-rim bg-surface-overlay/60 px-6 py-3">
        {[16, 20, 28, 24].map((w, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-rim" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className={`grid gap-3 border-b border-rim bg-surface-raised px-6 py-3 ${cols}`}>
        {Array.from({ length: showStake ? 5 : 4 }).map((_, i) => (
          <div key={i} className="h-2.5 animate-pulse rounded bg-rim" />
        ))}
      </div>
      <div className="divide-y divide-rim">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`grid gap-3 items-center px-6 py-4 ${cols}`}>
            <div className="h-3 w-5 animate-pulse rounded bg-rim" />
            <div className="h-8 w-8 animate-pulse rounded bg-rim" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-rim" />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-overlay" />
            </div>
            <div className="ml-auto h-5 w-8 animate-pulse rounded bg-rim" />
            {showStake && <div className="h-8 animate-pulse rounded bg-surface-overlay" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OddsBoard({
  raceId,
  betAmounts,
  onAmountChange,
  canBet,
  bettable,
  embedded,
  userBets,
}: {
  raceId: number;
  betAmounts: BetAmounts;
  onAmountChange: (id: number, value: string) => void;
  canBet: boolean;
  bettable: boolean;
  embedded: boolean;
  userBets: Record<number, { amount: number; status: string }>;
}) {
  const { race, loading: rl } = useRaceDetail(raceId);
  const { entries: raw, loading: el } = useHorsesByRace(raceId);

  const entries = useMemo((): HorseEntry[] =>
    (assignLanes(
      raw.filter(isRunnerEntry) as Parameters<typeof assignLanes>[0]
    ) as HorseEntry[]).sort((a, b) => (a.odds ?? Infinity) - (b.odds ?? Infinity)),
    [raw]
  );

  const showStake = canBet && bettable;
  const [bannerError, setBannerError] = useState(false);
  useEffect(() => { setBannerError(false); }, [race?.bannerImageurl]);

  if (rl || el) return <OddsBoardSkeleton showStake={showStake} />;
  if (!race) return null;

  const showBanner = !!race.bannerImageurl && !bannerError;

  const infoItems: Array<{ label: string; value: string }> = [
    { label: 'Date', value: fmtDate(race.startTime) },
    { label: 'Post Time', value: fmtTime(race.startTime) },
    ...(race.endTime ? [{ label: 'End Time', value: fmtTime(race.endTime) }] : []),
    ...(race.trackName ? [{ label: 'Track', value: race.trackName }] : []),
    ...(race.location ? [{ label: 'Location', value: race.location }] : []),
    ...(race.distance != null && race.distance !== '' ? [{ label: 'Distance', value: String(race.distance) }] : []),
    ...(race.surfaceType ? [{ label: 'Surface', value: race.surfaceType }] : []),
    ...(race.trackCondition ? [{ label: 'Track Condition', value: race.trackCondition }] : []),
    ...(race.capacity != null ? [{ label: 'Capacity', value: `${race.capacity} horses` }] : []),
    ...(race.entryFee != null ? [{ label: 'Entry Fee', value: fmtVnd(race.entryFee) }] : []),
    ...(race.registrationDeadline ? [{ label: 'Reg. Deadline', value: fmtDate(race.registrationDeadline) }] : []),
  ];

  return (
    <div className="flex flex-col">
      {embedded ? (
        /* Homepage: full race details in place of the banner image */
        <div className="border-b border-rim bg-surface-overlay/40 px-6 py-4">
          <h2 className="mb-3 font-serif text-xl font-bold text-ink sm:text-2xl">{race.raceName}</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-4">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <>
          {/* Banner — kept as a dark photo-caption island (matches the app's card-on-photo
              convention elsewhere) so the title stays legible regardless of page theme. */}
          <div className="relative h-48 overflow-hidden">
            {showBanner ? (
              <img
                src={race.bannerImageurl}
                alt={race.raceName}
                className="h-full w-full object-cover opacity-60"
                onError={() => setBannerError(true)}
              />
            ) : (
              <div className="relative h-full w-full bg-navy-deep">
                <div className="absolute inset-0 opacity-[0.07]" style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, var(--c-gold) 0 2px, transparent 2px 28px)',
                }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(168,132,59,0.16),transparent_60%)]" />
                <Trophy size={220} strokeWidth={0.6} className="absolute -right-8 -top-8 text-gold/[0.07]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp size={12} className="text-gold/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">Live Odds</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">{race.raceName}</h2>
            </div>
          </div>

          {/* Meta strip */}
          <div className="flex flex-wrap gap-5 border-b border-rim bg-surface-overlay/60 px-6 py-3">
            <span className="flex items-center gap-1.5 text-xs text-ink-3"><Clock size={11} /> {fmtTime(race.startTime)}</span>
            {race.distance && <span className="flex items-center gap-1.5 text-xs text-ink-3"><Flag size={11} /> {race.distance}</span>}
            {race.location && <span className="flex items-center gap-1.5 text-xs text-ink-3"><MapPin size={11} /> {race.location}</span>}
            {race.totalprizepool != null && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-hi">
                <Trophy size={11} /> {fmtPrize(race.totalprizepool)}
              </span>
            )}
          </div>
        </>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Flag size={32} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">No confirmed entries with odds yet.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className={`grid gap-3 border-b border-rim bg-surface-raised px-6 py-3 ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">PP</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Runner</span>
            <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Odds</span>
            {showStake && <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Stake (₫)</span>}
          </div>

          {/* Runner rows */}
          <div className="divide-y divide-rim">
            {entries.map((e, idx) => {
              const laneStyle = LANE_STYLE[e.laneNumber ?? 0];
              const isFav = idx === 0;
              const hasStake = !!betAmounts[e.id] && parseInt(betAmounts[e.id]) > 0;

              return (
                <div key={e.id}
                  className={`grid gap-3 items-center px-6 py-4 transition-colors ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'} ${hasStake ? 'bg-gold/[0.06]' : isFav ? 'bg-gold/[0.035]' : 'hover:bg-surface-overlay/50'}`}>

                  {/* Row number */}
                  <span className="tabular-nums text-sm font-medium text-ink-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Post position */}
                  <div className="flex h-8 w-8 items-center justify-center text-sm font-bold"
                    style={laneStyle
                      ? { backgroundColor: laneStyle.bg, color: laneStyle.color }
                      : { backgroundColor: 'rgba(19,28,21,0.06)', color: 'rgba(19,28,21,0.35)' }}>
                    {e.laneNumber ?? '—'}
                  </div>

                  {/* Horse info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold uppercase tracking-wide text-ink">{e.horseName}</p>
                      {isFav && (
                        <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-hi">
                          Fav
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-4">
                      Jockey: <span className="text-ink-3">{e.jockeyName ?? 'TBA'}</span>
                    </p>
                    {(e.ownerName || e.trainerName) && (
                      <p className="mt-0.5 truncate text-[11px] text-ink-4">
                        {e.ownerName && <>Owner: <span className="text-ink-3">{e.ownerName}</span></>}
                        {e.ownerName && e.trainerName && <span className="mx-1.5">·</span>}
                        {e.trainerName && <>Trainer: <span className="text-ink-3">{e.trainerName}</span></>}
                      </p>
                    )}
                    {userBets[e.id] && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-hi">
                        Your bet: {fmtVnd(userBets[e.id].amount)}
                      </span>
                    )}
                  </div>

                  {/* Odds */}
                  <div className="text-right">
                    <span className="tnum text-xl font-bold text-gold-hi leading-none">{e.odds}</span>
                  </div>

                  {/* Inline stake input */}
                  {showStake && (
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={betAmounts[e.id] ?? ''}
                        onChange={ev => onAmountChange(e.id, ev.target.value)}
                        className={`w-full appearance-none rounded border py-2 pl-2.5 pr-5 text-right text-xs font-semibold outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-ink-4 ${
                          hasStake
                            ? 'border-gold/50 bg-gold/10 text-gold-hi focus:border-gold/70 focus:ring-1 focus:ring-gold/20'
                            : 'border-rim bg-surface-input text-ink focus:border-gold/40 focus:bg-surface-raised focus:ring-1 focus:ring-gold/15'
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-ink-4">₫</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
