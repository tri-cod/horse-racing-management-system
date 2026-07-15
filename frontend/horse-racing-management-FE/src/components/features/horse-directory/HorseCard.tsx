import { Rabbit, Flag } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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
      className="group relative h-64 cursor-pointer overflow-hidden rounded-md border border-on-blue/10 shadow-lg shadow-navy-deep/25"
      onClick={() => onClick?.(horse)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(horse); } }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Photo or silhouette, full-bleed */}
      {horse.avatarUrl ? (
        <img src={horse.avatarUrl} alt={horse.horseName} loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-overlay">
          <Rabbit size={72} strokeWidth={0.6} className="text-navy/10" />
        </div>
      )}

      {/* Gradient scrim for legible text */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/45 to-navy/5" />

      {/* Racing-silk number tab, top-right */}
      <div className="absolute right-0 top-4 z-10 flex h-8 items-center rounded-l-full bg-navy/80 py-1 pl-3 pr-4 backdrop-blur-sm">
        <span className="tnum text-xs font-bold text-gold">#{horse.horseId}</span>
      </div>

      {/* Content, bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <h3 className="font-serif text-2xl font-bold uppercase leading-tight text-on-blue group-hover:text-gold transition-colors">
          {horse.horseName}
        </h3>
        {horse.breed && <p className="mt-1 text-sm text-on-blue/60">{horse.breed}</p>}

        {horse.currentRaceName && (
          <div className="mt-2 flex items-center gap-1.5 border-t border-on-blue/15 pt-2 text-xs text-on-blue/50">
            <Flag size={11} className="shrink-0 text-gold/70" /> <span className="truncate">{horse.currentRaceName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}