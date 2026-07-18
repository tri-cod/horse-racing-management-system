import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, ArrowRight, Gavel } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import Silk from '@/components/shared/Silk';
import { useUpcomingRaces } from '@/hooks/useUpcomingRaces';
import type { Race } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso?: string) {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return d > 0 ? d : null;
}

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Upcoming', OPEN_REGISTRATION: 'Open', CLOSED_REGISTRATION: 'Entries Closed', ONGOING: 'Live', FINISHED: 'Finished',
};

function RaceCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden border border-rim bg-surface-raised" aria-hidden="true">
      <div className="h-44 bg-surface-overlay" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-2/3 bg-surface-overlay" />
        <div className="h-3 w-1/2 bg-surface-overlay" />
        <div className="h-3 w-3/4 bg-surface-overlay" />
      </div>
    </div>
  );
}

function RaceCardRd({ race, idx }: { race: Race; idx: number }) {
  const days = daysUntil(race.startTime);
  return (
    <article className="group overflow-hidden border border-rim bg-surface-raised transition hover:border-gold/40 hover:shadow-xl hover:shadow-surface/60">
      <div className="flex items-center justify-between px-4 py-3 border-b border-rim">
        <div className="flex items-center gap-2">
          <Silk variant={(idx % 6) + 1} size={20} />
          <span className="text-xs font-semibold text-ink-3">Race {String(idx + 1).padStart(2, '0')}</span>
        </div>
        <span className="rounded-full bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
          {STATUS_LABEL[race.status] ?? race.status}
        </span>
      </div>
      <div className="relative h-44 overflow-hidden bg-surface-overlay">
        {race.bannerImageurl
          ? <img src={race.bannerImageurl} alt={race.raceName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          : <div className="flex h-full items-center justify-center text-ink-4 text-xs">No image</div>
        }
        {days != null && (
          <span className="absolute right-3 top-3 rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-semibold text-gold backdrop-blur-sm">{days}d away</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="mb-3 font-bold text-ink line-clamp-1">{race.raceName}</h3>
        <ul className="mb-4 space-y-1">
          <li className="flex items-center gap-2 text-xs text-ink-2"><Calendar size={12} />{formatDate(race.startTime)}</li>
          {race.location && <li className="flex items-center gap-2 text-xs text-ink-2"><MapPin size={12} />{race.location}</li>}
          {race.totalprizepool != null && <li className="flex items-center gap-2 text-xs text-gold/80"><Trophy size={12} />${Number(race.totalprizepool).toLocaleString()}</li>}
        </ul>
        <div className="flex items-center justify-between gap-3 border-t border-rim pt-3">
          <Link to={`/races?date=${race.startTime?.slice(0, 10) ?? ''}`} className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-hi transition-colors">
            Race Details <ArrowRight size={12} />
          </Link>
          {race.refereeId ? (
            <Link to={`/referees/${race.refereeId}`} className="flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-gold transition-colors">
              <Gavel size={12} /> View Referee
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-ink-4">
              <Gavel size={12} /> Referee TBA
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function RacesSection() {
  const { races, loading } = useUpcomingRaces(3);

  return (
    <section className="py-32 bg-surface">
      <Container>
        <SectionHeader title="Upcoming Races"
          subtitle="Don't miss the next thrilling showdowns of the Royal Derby 2026 season." />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? [0, 1, 2].map((i) => <RaceCardSkeleton key={i} />)
            : races.length === 0
              ? (
                <div className="col-span-3 py-16 text-center">
                  <p className="text-ink-2">No upcoming races scheduled yet.</p>
                  <Link to="/races" className="mt-3 inline-block text-sm text-gold hover:text-gold-hi transition-colors">View all races →</Link>
                </div>
              )
              : races.map((race, idx) => (
                <Reveal key={race.id} delay={idx * 80}>
                  <RaceCardRd race={race} idx={idx} />
                </Reveal>
              ))
          }
        </div>
        {!loading && races.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/races" className="inline-flex items-center gap-2 border border-rim-hi px-6 py-2.5 text-sm font-medium text-ink-2 hover:border-gold hover:text-gold transition-colors">
              View Full Schedule <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}