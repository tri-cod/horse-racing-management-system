import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Calendar, Award, Activity } from 'lucide-react';
import { useJockeyProfile } from '@/hooks/useJockeyProfile';
import Container from '@/components/ui/Container';
import Seo from '@/components/seo/Seo';

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-2.5">
        <Icon size={16} className="text-ink-4" />
        <span className="text-sm text-ink-3">{label}</span>
      </div>
      <span className="text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default function JockeyProfilePage() {
  const { id } = useParams<{ id: string }>();
  const jockeyId = id ? Number(id) : undefined;

  const { jockey, loading, error } = useJockeyProfile(jockeyId);
  const initial = jockey?.name?.charAt(0)?.toUpperCase() ?? 'J';

  return (
    <div className="min-h-screen bg-surface pb-20">
      <Seo title={jockey?.name ?? 'Jockey Profile'} description="Jockey profile and details." />

      <Container className="py-6">
        <Link to="/jockeys" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 hover:text-gold transition-colors">
          <ChevronLeft size={14} /> Back to Jockeys
        </Link>

        {loading ? (
          <div className="mx-auto h-72 max-w-xl animate-pulse rounded-md bg-surface-overlay" />
        ) : !jockey ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-rim bg-surface-overlay py-24 text-center">
            <User size={40} className="text-ink-4" strokeWidth={1.5} />
            <p className="text-sm text-ink-3">{error ?? 'This jockey could not be found.'}</p>
          </div>
        ) : (
          <div className="mx-auto max-w-xl overflow-hidden rounded-md border border-rim shadow-lg shadow-navy-deep/5">
            {/* Cover — jockeys have no photo, so use a silks-inspired banner */}
            <div className="relative h-36 bg-navy-deep sm:h-40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(198,161,75,0.25),transparent_60%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
            </div>

            {/* Avatar (initial) overlapping cover, centered */}
            <div className="relative bg-surface-raised px-6 pb-6 pt-16 text-center sm:px-8">
              <div className="absolute -top-14 left-1/2 flex h-28 w-28 -translate-x-1/2 items-center justify-center rounded-full border-4 border-surface-raised bg-gold shadow-lg">
                <span className="font-serif text-5xl font-bold text-on-gold">{initial}</span>
              </div>

              {jockey.status && (
                <span className="mb-1.5 inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  {jockey.status}
                </span>
              )}
              <h1 className="font-serif text-3xl font-bold uppercase leading-tight text-ink">{jockey.name}</h1>
            </div>

            {/* Details */}
            <div className="flex flex-col divide-y divide-rim border-t border-rim bg-surface-raised px-6 py-1 sm:px-8">
              <InfoRow icon={User} label="Jockey ID" value={`#${jockey.id}`} />
              <InfoRow icon={Calendar} label="Age" value={jockey.age ? `${jockey.age} years old` : '—'} />
              <InfoRow icon={Award} label="Experience" value={jockey.experienceYear ? `${jockey.experienceYear} years` : '—'} />
              <InfoRow icon={Activity} label="Status" value={jockey.status ?? '—'} />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
