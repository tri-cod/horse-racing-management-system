import { useState } from 'react';
import { Flag, Trophy, Percent } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import cutout1 from '@/assets/img/profile/cutout/3774fa91aef3e7e508e20b35e5c424d3.png';
import cutout2 from '@/assets/img/profile/cutout/8cbc8134780b01dd7c83b4ed98ee3997.png';
import cutout3 from '@/assets/img/profile/cutout/d394ed90ff839d9668281fd9805388dc.png';
import cutout4 from '@/assets/img/profile/cutout/d59205a44febf510388bd99dab9dc1e2.png';
import cutout5 from '@/assets/img/profile/cutout/f5fa40528864e81334337a0cbfd05f7e.png';

interface FeaturedJockey {
  id: number;
  name: string;
  status: string;
  races: number;
  wins: number;
  winRate: number;
  /** Background-removed portrait (rider + horse), crossfaded on the left. */
  cutoutUrl?: string;
}

const JOCKEYS: FeaturedJockey[] = [
  { id: 1, name: 'Daniel Hayes', status: 'Champion', races: 42, wins: 18, winRate: 42.9, cutoutUrl: cutout1 },
  { id: 2, name: 'Marcus Reyes', status: 'Active', races: 35, wins: 15, winRate: 42.9, cutoutUrl: cutout2 },
  { id: 3, name: 'Sofia Alvarez', status: 'Active', races: 30, wins: 11, winRate: 36.7, cutoutUrl: cutout3 },
  { id: 4, name: 'Ethan Brooks', status: 'Rising Star', races: 28, wins: 9, winRate: 32.1, cutoutUrl: cutout4 },
  { id: 5, name: 'Isabelle Cruz', status: 'Elite', races: 38, wins: 14, winRate: 36.8, cutoutUrl: cutout5 },
];

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
  jockey: FeaturedJockey; offset: number; onSelect: () => void; reduce: boolean;
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
        <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
          active ? 'bg-gold/20 text-gold' : 'text-ink-4'
        }`}>
          {jockey.status}
        </span>
      </div>

      {/* Identity */}
      <div className="mb-5 flex items-center gap-3">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
          active ? 'border-gold bg-gold/20' : 'border-rim-hi bg-gold/10'
        }`}>
          <span className="font-serif text-xl font-bold text-gold">{initial}</span>
        </div>
        <h3 className="truncate text-left text-xl font-bold text-ink">{jockey.name}</h3>
      </div>

      <hr className="mb-5 border-rim" />

      {/* Stats */}
      <ul className="space-y-2 text-left">
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Flag size={15} className="shrink-0 text-ink-4" />{jockey.races} races
        </li>
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Trophy size={15} className="shrink-0 text-gold" />{jockey.wins} wins
        </li>
        <li className="flex items-center gap-2 text-base text-ink-2">
          <Percent size={15} className="shrink-0 text-ink-4" />{jockey.winRate.toFixed(1)}% win rate
        </li>
      </ul>
    </motion.div>
  );
}

export default function JockeysSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const selected = JOCKEYS[selectedIndex];

  return (
    <section className="overflow-hidden bg-surface-overlay pt-0">
      <Container>
        <SectionHeader
          eyebrow="Meet The Riders"
          title="Championship Jockeys"
          subtitle="The talented riders chasing glory across the Royal Derby season."
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          {/* Left — cutout portrait of the selected jockey, stretched to the section's full height */}
          <div className="relative mx-auto w-full self-stretch lg:col-span-2" style={{ minHeight: PORTRAIT_HEIGHT }}>
            <AnimatePresence initial={false}>
              <motion.img
                key={selected.id}
                src={selected.cutoutUrl}
                alt={selected.name}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0.2, ease: 'easeOut' } : { duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 h-full w-full object-contain object-bottom"
              />
            </AnimatePresence>
          </div>

          {/* Right — larger 3D ring selector, centered against the taller portrait column */}
          <div className="relative mx-auto w-full self-center lg:col-span-3" style={{ height: RING_HEIGHT, perspective: 1600 }}>
            {JOCKEYS.map((jockey, i) => (
              <JockeyThumb
                key={jockey.id}
                jockey={jockey}
                offset={ringOffset(i, selectedIndex, JOCKEYS.length)}
                onSelect={() => setSelectedIndex(i)}
                reduce={reduce}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
