import { User } from 'lucide-react';
import HorseStatusBadge from './HorseStatusBadge';
import type { Horse } from '@/types';

interface HorseCardProps {
  horse: Horse & { gender?: string; trainerName?: string };
  onClick?: () => void;
}

export default function HorseCard({ horse, onClick }: HorseCardProps) {
  const meta = [
    horse.breed,
    horse.age != null ? `${horse.age} yrs` : null,
    horse.weight != null ? `${horse.weight} kg` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div
      className="group relative cursor-pointer overflow-hidden border border-rim bg-surface-raised transition-all duration-200 hover:border-gold/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
    >
      {/* Gold top accent — slides in on hover */}
      <div className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />

      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-navy/10 to-navy/25">
        {horse.avatarUrl ? (
          <img
            src={horse.avatarUrl}
            alt={horse.horseName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-serif text-6xl font-bold text-navy/20 select-none">
              {horse.horseName?.charAt(0)?.toUpperCase() ?? 'H'}
            </span>
          </div>
        )}

        {/* Scrim for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <HorseStatusBadge status={horse.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 font-serif text-base font-bold uppercase tracking-wide text-ink transition-colors duration-150 group-hover:text-navy">
          {horse.horseName}
        </h3>

        <p className="mb-4 min-h-[1rem] text-xs text-ink-3">
          {meta || <span className="text-ink-4">No details recorded</span>}
        </p>

        <div className="flex items-center gap-1.5 border-t border-rim pt-3">
          <User size={11} className="shrink-0 text-ink-4" />
          <span className="truncate text-xs text-ink-3">
            {horse.trainerName ?? 'No trainer assigned'}
          </span>
        </div>
      </div>
    </div>
  );
}
