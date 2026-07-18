import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Flag, ShieldAlert, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useRefereeProfile } from '@/hooks/useRefereeProfile';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-4 border border-rim bg-surface-raised px-5 py-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-gold/10 text-gold">
        <Icon size={20} />
      </div>
      <div>
        <p className="tnum text-2xl font-bold leading-none text-ink">{value}</p>
        <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">{label}</p>
      </div>
    </div>
  );
}

export default function RefereeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { referee, loading, error } = useRefereeProfile(id ? Number(id) : undefined);

  if (loading) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6"><div className="h-64 animate-pulse bg-surface-overlay" /></Container>
    </div>
  );

  if (!referee) return (
    <div className="min-h-screen bg-surface pb-20">
      <Container className="py-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold"><ChevronLeft size={14} /> Home</Link>
        <div className="flex flex-col items-center gap-3 border border-rim bg-surface-overlay py-24 text-center">
          <User size={40} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">{error ?? 'This referee could not be found.'}</p>
        </div>
      </Container>
    </div>
  );

  const races = referee.totalRacesRefereed ?? 0;
  const penalties = referee.totalPenaltiesGiven ?? 0;
  const cleanRate = races > 0 ? Math.round(((races - Math.min(penalties, races)) / races) * 100) : null;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <Seo title={referee.name} description={`Referee profile for ${referee.name}.`} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-deep">
        {referee.coverImageUrl && <img src={referee.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/85" />
        <Container className="relative z-10 pb-20 pt-8 sm:pb-24">
          <Link to="/" className="mb-8 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:text-gold">
            <ChevronLeft size={14} /> Home
          </Link>
          <div className="flex flex-col items-center gap-8 text-center sm:flex-row sm:text-left">
            <div className="h-36 w-36 shrink-0 overflow-hidden border-2 border-gold/70 bg-navy shadow-xl shadow-black/40 sm:h-40 sm:w-40">
              {referee.avatarUrl
                ? <img src={referee.avatarUrl} alt={referee.name} className="h-full w-full object-cover" />
                : <div className="flex h-full w-full items-center justify-center bg-gold text-5xl font-bold text-on-gold">{referee.name.charAt(0).toUpperCase()}</div>}
            </div>
            <div>
              <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold-hi">
                <BadgeCheck size={14} /> Royal Derby Referee
              </span>
              <h1 className="font-serif text-4xl font-bold uppercase leading-[0.95] text-white sm:text-5xl">{referee.name}</h1>
              {referee.experienceYears != null && (
                <p className="mt-4 text-base font-medium text-white/85">{referee.experienceYears} years of experience officiating</p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Stat cards — overlapping the hero for a polished, editorial feel */}
      <Container className="relative z-10 -mt-14 sm:-mt-16">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard icon={Flag} label="Races Refereed" value={races} />
          <StatCard icon={ShieldAlert} label="Penalties Issued" value={penalties} />
          {cleanRate != null && (
            <StatCard icon={ShieldCheck} label="Clean Record" value={`${cleanRate}%`} />
          )}
        </div>
      </Container>

      <Container className="pt-12">
        <div className="mx-auto max-w-3xl space-y-14">
          {referee.description ? (
            <section>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Biography</h2>
              <div className="mt-6 border-l-2 border-gold/40 pl-6">
                <p className="max-w-prose text-[15px] leading-relaxed text-ink-2">{referee.description}</p>
              </div>
            </section>
          ) : (
            <section>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-ink">Biography</h2>
              <p className="mt-6 text-sm text-ink-4">No biography provided yet.</p>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}