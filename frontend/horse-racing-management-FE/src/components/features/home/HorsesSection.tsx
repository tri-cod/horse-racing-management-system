import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Flag } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { useHorses } from '@/hooks/useHorses';
import { silkColor } from '@/utils/jockeySilks';
import type { HorseCurrentStatusResponse } from '@/types';

const DISPLAY_LIMIT = 8;
const PORTRAIT_HEIGHT = 560;

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
        className={`flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors ${
          active ? 'bg-gold/10' : 'hover:bg-surface-overlay/60'
        }`}
      >
        {/* Rank */}
        <span className={`tnum w-7 shrink-0 text-lg font-bold ${
          rank === 1 ? 'text-gold-hi' : active ? 'text-ink' : 'text-ink-4'
        }`}>
          {String(rank).padStart(2, '0')}
        </span>

        {/* Avatar — ringed in the horse's own signature racing colour */}
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-navy/5"
          style={{ borderColor: active ? accent : `${accent}55` }}
        >
          {horse.avatarUrl ? (
            <img src={horse.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-base font-bold" style={{ color: accent }}>{initial}</span>
          )}
        </div>

        {/* Name + breed */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-ink">{horse.horseName}</p>
          {horse.breed && <p className="truncate text-xs text-ink-4">{horse.breed}</p>}
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

  return (
    <section className="overflow-hidden bg-surface pt-10">
      <Container>
        {loading && <p className="text-center text-sm text-ink-3">Loading horses…</p>}

        {!loading && (error || shown.length === 0) && (
          <p className="text-center text-sm text-ink-3">{error ?? 'No horses to show yet.'}</p>
        )}

        {!loading && !error && selected && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Right (visually) — section header + stable roster */}
            <div className="order-2 lg:col-span-3">
              <SectionHeader
                align="left"
                eyebrow="The Stable"
                title="Featured Horses of Royal Derby"
                subtitle="The current lineup carrying the colours of Royal Derby into every race."
              />
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

              <div className="mt-8">
                <Link
                  to="/horses"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy underline decoration-navy/30 underline-offset-4 transition-colors hover:text-gold-hi hover:decoration-gold-hi/50"
                >
                  View Full Stable <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Left (visually) — portrait of the selected horse */}
            <div className="relative order-1 mx-auto w-full self-stretch overflow-hidden rounded-md lg:col-span-2" style={{ minHeight: PORTRAIT_HEIGHT }}>
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
                    className="absolute inset-y-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-cover"
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

              {/* Caption plate — name, breed, current race, link into the profile */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/50 to-transparent p-7 pt-16">
                <div className="pointer-events-auto flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-3xl italic text-on-blue">{selected.horseName}</h3>
                    {selected.currentRaceName && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-on-blue/60">
                        <Flag size={11} className="shrink-0 text-gold/70" /> {selected.currentRaceName}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/horses/${selected.horseId}`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-blue/25 text-on-blue/70 transition-all hover:border-gold hover:bg-gold hover:text-navy-deep"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
