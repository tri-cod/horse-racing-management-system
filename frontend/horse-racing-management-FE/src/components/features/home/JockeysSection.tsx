import { useState } from 'react';
import { Flag, Trophy, Percent } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import { useTopJockeys } from '@/hooks/useTopJockeys';
import type { Jockey } from '@/types';

const RING_HEIGHT = 460;
const PORTRAIT_HEIGHT = 680;

const CARD_WIDTH = 300;
const CARD_HEIGHT = 260; // estimate, used only to vertically center the ring
const STEP_X = 175; // px between adjacent ring positions
const STEP_ROTATE = 28; // deg of Y-rotation per step
const STEP_SCALE = 0.15;
const STEP_OPACITY = 0.28;

/** Shortest signed distance from `selected` to `index` around a ring of `total` cards. */
function ringOffset(index: number, selected: number, total: number) {
  let diff = index - selected;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function JockeyThumb({ jockey, offset, onSelect, reduce }: {
  jockey: Jockey; offset: number; onSelect: () => void; reduce: boolean;
}) {
  const active = offset === 0;
  const abs = Math.abs(offset);
  const initial = jockey.name.charAt(0).toUpperCase();

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      animate={{
        x: offset * STEP_X,
        y: active ? -10 : 0,
        rotateY: offset * -STEP_ROTATE,
        scale: Math.max(1 - abs * STEP_SCALE, 0.55),
        opacity: Math.max(1 - abs * STEP_OPACITY, 0.3),
      }}
      transition={reduce ? { duration: 0.2, ease: 'easeOut' } : {
        x: { type: 'spring', stiffness: 130, damping: 15 },
        y: { type: 'spring', stiffness: 130, damping: 12 },
        rotateY: { type: 'spring', stiffness: 130, damping: 15 },
        scale: { type: 'spring', stiffness: 160, damping: 13 },
        opacity: { duration: 0.5, ease: 'easeOut' },
      }}
      style={{ width: CARD_WIDTH, marginLeft: -CARD_WIDTH / 2, marginTop: -CARD_HEIGHT / 2, zIndex: 10 - abs }}
      className={`absolute left-1/2 top-1/2 cursor-pointer rounded-md border p-7 text-center backdrop-blur-md ${
        active ? 'border-gold/50 bg-surface-raised/90 shadow-hero' : 'border-rim bg-surface-raised/70 shadow-modal'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="eyebrow whitespace-nowrap">Jockey</span>
      </div>

      {/* Identity */}
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
          active ? 'border-gold bg-gold/20' : 'border-rim-hi bg-gold/10'
        }`}>
          {jockey.avatarUrl ? (
            <img src={jockey.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-serif text-xl font-bold text-gold">{initial}</span>
          )}
        </div>
        <h3 className="truncate text-left text-xl font-bold text-ink">{jockey.name}</h3>
      </div>

      <hr className="mb-5 border-rim" />

      {/* Stats */}
      <ul className="space-y-2 text-left">
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Flag size={15} className="shrink-0 text-ink-4" />{jockey.totalRaces ?? 0} races
        </li>
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Trophy size={15} className="shrink-0 text-gold" />{jockey.totalWins ?? 0} wins
        </li>
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Percent size={15} className="shrink-0 text-ink-4" />{(jockey.winRate ?? 0).toFixed(1)}% win rate
        </li>
      </ul>
    </motion.div>
  );
}

export default function JockeysSection() {
  const { jockeys, loading, error } = useTopJockeys(5);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const selected = jockeys[selectedIndex];

  return (
    <section className="overflow-hidden bg-surface-overlay pt-10 ">
      <Container>
        <SectionHeader
          title={<>Top <span className="[font-variant-numeric:lining-nums]">5</span> Championship Jockeys in <span className="[font-variant-numeric:lining-nums]">2026</span></>}
          subtitle="The talented riders chasing glory across the Royal Derby season."
        />

        {loading && (
          <p className="text-center text-sm text-ink-3">Loading jockeys…</p>
        )}

        {!loading && (error || jockeys.length === 0) && (
          <p className="text-center text-sm text-ink-3">{error ?? 'No jockeys to show yet.'}</p>
        )}

        {!loading && !error && selected && (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
            {/* Left — portrait of the selected jockey, stretched to the section's full height */}
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

            {/* Right — larger 3D ring selector, centered against the taller portrait column */}
            <div className="relative mx-auto w-full self-center lg:col-span-3" style={{ height: RING_HEIGHT, perspective: 1600 }}>
              {jockeys.map((jockey, i) => (
                <JockeyThumb
                  key={jockey.id}
                  jockey={jockey}
                  offset={ringOffset(i, selectedIndex, jockeys.length)}
                  onSelect={() => setSelectedIndex(i)}
                  reduce={reduce}
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}