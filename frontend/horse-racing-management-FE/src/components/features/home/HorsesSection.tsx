import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Rabbit, Flag } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { useHorses } from '@/hooks/useHorses';
import type { HorseCurrentStatusResponse } from '@/types';

const DISPLAY_LIMIT = 6;

/** Visual treatment per status ΓÇö color + label shown on the right-hand info panel */
const STATUS_STYLE: Record<string, { label: string; color: string; dot: string }> = {
  RACING: { label: 'Racing Now', color: 'text-gold', dot: 'bg-gold' },
  ACTIVE: { label: 'Active', color: 'text-emerald-400', dot: 'bg-emerald-400' },
  FINISHED: { label: 'Finished', color: 'text-on-blue/60', dot: 'bg-on-blue/40' },
  INACTIVE: { label: 'Inactive', color: 'text-on-blue/40', dot: 'bg-on-blue/25' },
  RETIRED: { label: 'Retired', color: 'text-on-blue/40', dot: 'bg-on-blue/25' },
};

/** Photo with graceful fallback if the avatar URL is broken or missing */
function HorsePhoto({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  const [errored, setErrored] = useState(false);
  const showImage = avatarUrl && !errored;

  return (
    <>
      {showImage ? (
        <img
          src={avatarUrl}
          alt={name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <Rabbit size={44} strokeWidth={0.5} className="text-white/15" />
        </div>
      )}
    </>
  );
}

function HorseRow({ horse }: { horse: HorseCurrentStatusResponse }) {
  const status = horse.status ? STATUS_STYLE[horse.status] : undefined;

  return (
    <Reveal>
      <Link
        to={`/horses/${horse.horseId}`}
        className="group relative flex min-h-[132px] items-stretch overflow-hidden border-l-[6px] border-white/20 bg-white/[0.025] transition-all duration-300 [clip-path:polygon(0_0,100%_0,97%_100%,0%_100%)] hover:border-gold/50 hover:bg-white/[0.05] sm:min-h-[168px]"
      >
        {/* Photo */}
        <div className="relative h-auto w-28 shrink-0 self-stretch overflow-hidden bg-white/5 sm:w-48">
          <HorsePhoto avatarUrl={horse.avatarUrl} name={horse.horseName} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="absolute bottom-2 left-2.5 tnum text-[10px] font-bold tracking-wider text-gold/90 sm:text-xs">
            #{horse.horseId}
          </span>
        </div>

        {/* Identity */}
        <div className="relative flex min-w-0 flex-1 flex-col justify-center px-5 sm:px-8">
          <h3 className="truncate font-serif text-3xl font-black italic uppercase leading-[0.95] tracking-tight text-white transition-colors group-hover:text-gold sm:text-5xl">
            {horse.horseName}
          </h3>
          {horse.breed && (
            <span className="mt-2 truncate text-[11px] font-bold uppercase tracking-[0.25em] text-white/45 sm:text-xs">
              {horse.breed}
            </span>
          )}
        </div>

        {/* Info panel ΓÇö status + current race, the only data the API currently provides */}
        <div className="relative hidden shrink-0 items-stretch divide-x divide-white/10 sm:flex">
          {status && (
            <div className="flex w-36 flex-col items-center justify-center gap-2 px-5 text-center">
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${status.dot} shadow-[0_0_8px_currentColor]`} />
                <span className={`text-sm font-black uppercase tracking-wide ${status.color}`}>{status.label}</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Status</span>
            </div>
          )}
          {horse.currentRaceName && (
            <div className="flex w-44 flex-col items-center justify-center gap-2 px-5 text-center">
              <span className="flex items-center gap-2 truncate text-sm font-black text-white/90">
                <Flag size={14} className="shrink-0 text-gold/70" />
                <span className="truncate">{horse.currentRaceName}</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30">Current Race</span>
            </div>
          )}
        </div>

        <div className="relative flex shrink-0 items-center pr-5 sm:pr-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/40 transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-navy-deep sm:h-11 sm:w-11">
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
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
    <section className="relative overflow-hidden bg-navy-deep py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(100deg, #ffffff 0, #ffffff 1px, transparent 1px, transparent 40px)' }}
      />

      <Container className="relative">
        <SectionHeader
          invert
          eyebrow="The Stable"
          title="Featured Horses of Royal Derby"
          subtitle="The current lineup carrying the colors of Royal Derby into every race."
        />

        {loading && <p className="text-center text-sm text-on-blue/50">Loading horses…</p>}

        {!loading && (error || shown.length === 0) && (
          <p className="text-center text-sm text-on-blue/50">{error ?? 'No horses to show yet.'}</p>
        )}

        {!loading && !error && shown.length > 0 && (
          <div className="flex flex-col gap-4 sm:gap-5">
            {shown.map((horse) => (
              <HorseRow key={horse.horseId} horse={horse} />
            ))}
          </div>
        )}

        {!loading && !error && horses.length > 0 && (
          <div className="mt-10 text-right">
            <Link
              to="/horses"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold underline decoration-gold/40 underline-offset-4 transition-colors hover:text-gold-hi"
            >
              View Full Stable <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}