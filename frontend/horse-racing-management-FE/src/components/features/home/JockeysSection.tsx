import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { useTopJockeys } from '@/hooks/useTopJockeys';
import type { Jockey } from '@/types';

const PORTRAIT_HEIGHT = 680;

function JockeyRow({ jockey, rank, active, onSelect }: {
  jockey: Jockey; rank: number; active: boolean; onSelect: () => void;
}) {
  const initial = jockey.name.charAt(0).toUpperCase();

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={`flex w-full items-center gap-4 px-5 py-3 text-left transition-colors ${
          active ? 'bg-gold/10' : 'hover:bg-surface-overlay/60'
        }`}
      >
        {/* Rank */}
        <span className={`tnum w-7 shrink-0 text-lg font-bold ${
          rank === 1 ? 'text-gold-hi' : active ? 'text-ink' : 'text-ink-4'
        }`}>
          {String(rank).padStart(2, '0')}
        </span>

        {/* Avatar */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
          active ? 'border-gold bg-gold/20' : 'border-rim-hi bg-gold/10'
        }`}>
          {jockey.avatarUrl ? (
            <img src={jockey.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-base font-bold text-gold">{initial}</span>
          )}
        </div>

        {/* Name */}
        <p className="min-w-0 flex-1 truncate text-base font-bold text-ink">{jockey.name}</p>

        {/* Stats */}
        <div className="hidden shrink-0 items-center gap-5 text-sm sm:flex">
          <span className="text-ink-4">
            Races: <span className="tnum font-semibold text-ink-2">{jockey.totalRaces ?? 0}</span>
          </span>
          <span className="text-ink-4">
            Wins: <span className="tnum font-semibold text-gold-hi">{jockey.totalWins ?? 0}</span>
          </span>
          <span className="text-ink-4">
            Win rate: <span className="tnum font-semibold text-ink-2">{(jockey.winRate ?? 0).toFixed(1)}%</span>
          </span>
        </div>
      </button>
    </li>
  );
}

export default function JockeysSection() {
  const { jockeys, loading, error } = useTopJockeys(10);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const selected = jockeys[selectedIndex];

  return (
    <section className="overflow-hidden bg-surface-overlay pt-10">
      <Container>
        {loading && (
          <p className="text-center text-sm text-ink-3">Loading jockeys…</p>
        )}

        {!loading && (error || jockeys.length === 0) && (
          <p className="text-center text-sm text-ink-3">{error ?? 'No jockeys to show yet.'}</p>
        )}

        {!loading && !error && selected && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Left — section header + top-10 list */}
            <div className="lg:col-span-3">
              <SectionHeader
                align="left"
                title={<>Top <span className="[font-variant-numeric:lining-nums]">10</span> Championship Jockeys in <span className="[font-variant-numeric:lining-nums]">2026</span></>}
                subtitle="The talented riders chasing glory across the Royal Derby season."
              />
              <ol className="divide-y divide-rim overflow-hidden rounded-md border border-rim bg-surface-raised shadow-card">
                {jockeys.map((jockey, i) => (
                  <JockeyRow
                    key={jockey.id}
                    jockey={jockey}
                    rank={i + 1}
                    active={i === selectedIndex}
                    onSelect={() => setSelectedIndex(i)}
                  />
                ))}
              </ol>
            </div>

            {/* Right — portrait of the selected jockey, stretched to the column's full height */}
            <div className="relative mx-auto w-full self-stretch overflow-hidden rounded-md lg:col-span-2" style={{ minHeight: PORTRAIT_HEIGHT }}>
              <AnimatePresence initial={false}>
                {selected.avatarUrl ? (
                  <motion.img
                    key={selected.id}
                    src={selected.avatarUrl}
                    alt={selected.name}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2"
                  />
                ) : (
                  <motion.div
                    key={selected.id}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 flex items-center justify-center bg-gold/10"
                  >
                    <span className="font-serif text-8xl font-bold text-gold/40">
                      {selected.name.charAt(0).toUpperCase()}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
