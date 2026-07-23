import { Rabbit, Flag, Waves } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatPreferredDistance } from '@/utils/horsePreferences';
import type { HorseCurrentStatusResponse } from '@/types';

interface HorseCardProps {
  horse: HorseCurrentStatusResponse;
  index?: number;
  onClick?: (horse: HorseCurrentStatusResponse) => void;
}

export default function HorseCard({ horse, onClick }: HorseCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group flex h-full min-h-[340px] cursor-pointer flex-col overflow-hidden rounded-md border border-rim bg-surface-raised shadow-lg shadow-navy-deep/10"
      onClick={() => onClick?.(horse)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(horse); } }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Header — name / breed, F1 team-card style. Status is intentionally not
          shown here — it's internal-only info, visible on the owner/admin side
          but not on the public directory. */}
      <div className="flex items-start justify-between gap-3 px-6 pb-3 pt-6">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-3xl font-bold uppercase leading-tight text-ink transition-colors group-hover:text-gold-hi">
            {horse.horseName}
          </h3>
          {horse.breed && <p className="mt-1 text-sm text-ink-3">{horse.breed}</p>}
          {(horse.preferredDistance || horse.preferredSurface) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {horse.preferredDistance && (
                <span className="flex items-center gap-1 rounded-full border border-rim bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-ink-3">
                  <Flag size={9} className="text-gold/70" /> {formatPreferredDistance(horse.preferredDistance, true)}
                </span>
              )}
              {horse.preferredSurface && (
                <span className="flex items-center gap-1 rounded-full border border-rim bg-surface-overlay px-2 py-0.5 text-[10px] font-medium text-ink-3">
                  <Waves size={9} className="text-gold/70" /> {horse.preferredSurface}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-surface-overlay">
          <span className="tnum text-xs font-bold text-gold-hi">#{horse.horseId}</span>
        </div>
      </div>

      {/* Photo — fills the lower portion, like the car image on F1 team cards */}
      <div className="relative flex-1 overflow-hidden">
        {horse.avatarUrl ? (
          <img src={horse.avatarUrl} alt={horse.horseName} loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay">
            <Rabbit size={72} strokeWidth={0.6} className="text-navy/10" />
          </div>
        )}
        {horse.currentRaceName && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-navy-deep/90 to-transparent px-5 pb-3 pt-8 text-xs text-on-blue/70">
            <Flag size={11} className="shrink-0 text-gold/70" /> <span className="truncate">{horse.currentRaceName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}