import { Link } from 'react-router-dom';
import { ArrowRight, Flag, Rabbit } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { useHorses } from '@/hooks/useHorses';
import type { HorseCurrentStatusResponse } from '@/types';

const DISPLAY_LIMIT = 6;

function HorseRow({ horse, index }: { horse: HorseCurrentStatusResponse; index: number }) {
  const imageFirst = index % 2 === 0;

  return (
    <Reveal>
      <Link
        to={`/horses/${horse.horseId}`}
        className="group grid grid-cols-1 gap-8 border-t border-on-blue/10 py-12 first:border-t-0 lg:grid-cols-2 lg:items-stretch lg:gap-14 lg:min-h-[560px]"
      >
        {/* Photo */}
        <div className={`relative h-72 overflow-hidden rounded-md bg-on-blue/5 sm:h-96 lg:h-auto ${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
          {horse.avatarUrl ? (
            <img
              src={horse.avatarUrl}
              alt={horse.horseName}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Rabbit size={64} strokeWidth={0.6} className="text-on-blue/15" />
            </div>
          )}
          <span className="absolute left-4 top-4 tnum text-xs font-bold text-gold/80">#{horse.horseId}</span>
        </div>

        {/* Identity */}
        <div className={`flex flex-col justify-center ${imageFirst ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="mb-3 flex items-center gap-3">
            {horse.breed && (
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-on-blue/40">{horse.breed}</span>
            )}
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
              {horse.status ?? 'Active'}
            </span>
          </div>

          <h3 className="font-serif text-5xl font-bold uppercase leading-none text-on-blue transition-colors group-hover:text-gold sm:text-6xl lg:text-7xl">
            {horse.horseName}
          </h3>

          {horse.currentRaceName && (
            <div className="mt-5 flex items-center gap-2 border-t border-on-blue/10 pt-4 text-sm text-on-blue/55">
              <Flag size={14} className="shrink-0 text-gold/70" />
              <span className="truncate">{horse.currentRaceName}</span>
            </div>
          )}

          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-gold/80 transition-colors group-hover:text-gold">
            View Profile <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function HorsesSection() {
  const { horses, loading, error } = useHorses();
  const shown = horses.slice(0, DISPLAY_LIMIT);

  return (
    <section className="overflow-hidden bg-navy py-24">
      <Container>
        <SectionHeader
          invert
          eyebrow="The Stable"
          title="Meet the Horses of Royal Derby"
          subtitle="The purebred champions carrying the colors of Royal Derby into every race."
        />

        {loading && (
          <p className="text-center text-sm text-on-blue/50">Loading horses…</p>
        )}

        {!loading && (error || shown.length === 0) && (
          <p className="text-center text-sm text-on-blue/50">{error ?? 'No horses to show yet.'}</p>
        )}

        {!loading && !error && shown.length > 0 && (
          <div>
            {shown.map((horse, i) => (
              <HorseRow key={horse.horseId} horse={horse} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && horses.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/horses"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-gold hover:text-gold-hi transition-colors"
            >
              View the Full Stable <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
