import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useAuth } from '@/context/AuthContext';
import { useHorses } from '@/hooks/useHorses';
import { useHorseRaceHistory } from '@/hooks/useHorseRaceHistory';
import { formatPreferredDistance } from '@/utils/horsePreferences';
import { silkColor } from '@/utils/jockeySilks';
import type { HorseCurrentStatusResponse } from '@/types';

/* Compact rather than full currency: a career total runs to eight digits, which
   would truncate inside a stat column. "45 Tr ₫" stays readable at a glance. */
const fmtMoney = (n: number) =>
  `${new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)} ₫`;

const ORDINAL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };
const fmtFinish = (rank?: number) => (rank ? ORDINAL[rank] ?? `${rank}th` : 'None yet');

/* Backend sends surfaces as raw enum text (TURF, DIRT). */
const fmtSurface = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const DISPLAY_LIMIT = 8;
/* The photo sits in a frame of fixed proportion, so the card keeps one shape no
   matter what dimensions each uploaded image happens to have. Images are cropped
   to fill it rather than letterboxed. */
const PORTRAIT_ASPECT = '4 / 3';

function HorseRow({ horse, rank, active, onSelect }: {
  horse: HorseCurrentStatusResponse; rank: number; active: boolean; onSelect: () => void;
}) {
  const accent = silkColor({ id: horse.horseId, name: horse.horseName });
  const initial = horse.horseName.charAt(0).toUpperCase();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
          active ? 'bg-gold/10' : 'hover:bg-surface-overlay/60'
        }`}
      >
        {/* Rank */}
        <span className={`tnum w-6 shrink-0 text-sm font-bold ${
          rank === 1 ? 'text-gold-hi' : active ? 'text-ink' : 'text-ink-4'
        }`}>
          {String(rank).padStart(2, '0')}
        </span>

        {/* Avatar, ringed in the horse's own signature racing colour */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-navy/5"
          style={{ borderColor: active ? accent : `${accent}55` }}
        >
          {horse.avatarUrl ? (
            <img src={horse.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-xs font-bold" style={{ color: accent }}>{initial}</span>
          )}
        </div>

        {/* Name + breed */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{horse.horseName}</p>
          {horse.breed && <p className="truncate text-[11px] text-ink-4">{horse.breed}</p>}
        </div>
      </button>
    </li>
  );
}

export default function HorsesSection() {
  const { horses, loading, error } = useHorses();
  const shown = horses.slice(0, DISPLAY_LIMIT);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const selected = shown[selectedIndex];
  const accent = selected ? silkColor({ id: selected.horseId, name: selected.horseName }) : undefined;

  /* Career stats sit behind authentication (/api/race-results is not in the
     backend's PUBLIC_URLS), so the query is only armed for signed-in visitors.
     Passing undefined leaves it disabled rather than firing a guaranteed 401. */
  const { user } = useAuth();
  const { best, totalRewards, wins, racesRun, loading: statsLoading } =
    useHorseRaceHistory(user ? selected?.horseId : undefined);

  /* Only facts about the horse itself. Lifecycle flags (status, registrationStatus,
     currentRaceStatus) are deliberately left out: they read as internal plumbing. */
  const details = selected
    ? [
        ...(selected.preferredDistance
          ? [{ label: 'Preferred distance', value: formatPreferredDistance(selected.preferredDistance, true) ?? '' }]
          : []),
        ...(selected.preferredSurface ? [{ label: 'Preferred surface', value: fmtSurface(selected.preferredSurface) }] : []),
        /* Race names are the one long value here, so they get a double column. */
        ...(selected.currentRaceName
          ? [{ label: 'Current race', value: selected.currentRaceName, wide: true }]
          : []),
      ]
    : [];

  return (
    <section className="overflow-hidden bg-surface pt-10">
      <Container>
        {loading && <p className="text-center text-sm text-ink-3">Loading horses…</p>}

        {!loading && (error || shown.length === 0) && (
          <p className="text-center text-sm text-ink-3">{error ?? 'No horses to show yet.'}</p>
        )}

        {!loading && !error && selected && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Right (visually) — section header + stable roster */}
            <div className="order-2 lg:col-span-5">
              {/* Rendered inline instead of through SectionHeader: that component carries a
                  fixed mb-12, and the roster is meant to sit close under the title. */}
              <h2 className="mb-5 max-w-2xl font-serif text-3xl font-bold text-ink sm:text-4xl">
                Featured Horses of Royal Derby
              </h2>
              <ol className="divide-y divide-rim overflow-hidden rounded-md border border-rim bg-surface-raised shadow-card">
                {shown.map((horse, i) => (
                  <HorseRow
                    key={horse.horseId}
                    horse={horse}
                    rank={i + 1}
                    active={i === selectedIndex}
                    onSelect={() => setSelectedIndex(i)}
                  />
                ))}
              </ol>
            </div>

            {/* Left (visually) — profile card for whichever horse is selected in the list */}
            <div className="order-1 lg:col-span-7">
              <article className="flex h-full flex-col overflow-hidden bg-surface-raised shadow-modal">
                <div className="relative w-full overflow-hidden bg-surface-overlay" style={{ aspectRatio: PORTRAIT_ASPECT }}>
                  <AnimatePresence initial={false}>
                    {selected.avatarUrl ? (
                      <motion.img
                        key={selected.horseId}
                        src={selected.avatarUrl}
                        alt={selected.horseName}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduce ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <motion.div
                        key={selected.horseId}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={reduce ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.5, ease: 'easeOut' }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: `${accent}1a` }}
                      >
                        <span className="font-serif text-8xl font-bold" style={{ color: `${accent}66` }}>
                          {selected.horseName.charAt(0).toUpperCase()}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Details sit on solid surface below the photo rather than on a scrim
                    over it, so nothing has to darken the horse to stay readable. */}
                <div className="border-t border-rim p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-2xl font-bold text-ink">{selected.horseName}</h3>
                      {selected.breed && (
                        <p className="mt-0.5 truncate text-sm text-ink-3">{selected.breed}</p>
                      )}
                    </div>
                    <Link
                      to={`/horses/${selected.horseId}`}
                      className="inline-flex shrink-0 items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-2 transition-colors hover:border-gold hover:text-gold-hi"
                    >
                      View Profile <ArrowRight size={13} />
                    </Link>
                  </div>

                  {details.length > 0 && (
                    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                      {details.map((item) => (
                        <div key={item.label} className={'wide' in item && item.wide ? 'sm:col-span-2' : undefined}>
                          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-4">{item.label}</dt>
                          <dd className="mt-1 truncate text-sm font-semibold text-ink">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {/* Career record. Guests never reach this branch, so they get the
                      profile without a broken or empty stats row. */}
                  {user && (
                    <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-rim pt-5 sm:grid-cols-4">
                      {[
                        { label: 'Races run', value: String(racesRun), gold: false },
                        { label: 'Wins', value: String(wins), gold: true },
                        { label: 'Best finish', value: fmtFinish(best?.rank), gold: false },
                        { label: 'Earnings', value: fmtMoney(totalRewards ?? 0), gold: true },
                      ].map((stat) => (
                        <div key={stat.label}>
                          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-4">{stat.label}</dt>
                          {statsLoading ? (
                            <div className="mt-1.5 h-5 w-14 animate-pulse rounded bg-surface-overlay" />
                          ) : (
                            <dd className={`tnum mt-1 truncate text-lg font-bold ${stat.gold ? 'text-gold-hi' : 'text-ink'}`}>
                              {stat.value}
                            </dd>
                          )}
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </article>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
