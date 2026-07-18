import { useState } from 'react';
import { Flag, Calendar, MapPin, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMyRefereeRaces, type RefereeRaceScope } from '@/hooks/useMyRefereeRaces';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

const TABS: { key: RefereeRaceScope; label: string }[] = [
  { key: 'current', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function RefereeMyRacesPage() {
  const [scope, setScope] = useState<RefereeRaceScope>('current');
  const { races, loading, error } = useMyRefereeRaces(scope);

  return (
    <div className="px-8 py-6">
      <Seo title="My Races" />
      <DashboardPageHeader eyebrow="Referee" title="My Races" subtitle="Races assigned to you" />

      <div className="mb-5 flex gap-6 border-b border-rim">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setScope(t.key)}
            className={`border-b-2 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              scope === t.key ? 'border-gold text-ink' : 'border-transparent text-ink-4 hover:text-ink-2'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse border border-rim bg-surface-overlay" />)}</div>
      ) : error ? (
        <p className="py-6 text-sm text-fail">{error}</p>
      ) : races.length === 0 ? (
        <EmptyState icon={Flag} title="No races" subtitle="Nothing assigned in this category." />
      ) : (
        <div className="flex flex-col gap-3">
          {races.map((r) => (
            <div key={r.raceId} className="flex flex-wrap items-center gap-4 border border-rim bg-surface-raised px-5 py-4 transition-shadow hover:shadow-card">
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base font-bold text-ink">{r.raceName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-3">
                  <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(r.startTime)}</span>
                  {r.location && <span className="flex items-center gap-1"><MapPin size={11} />{r.location}</span>}
                  {r.totalHorses != null && <span className="tnum">{r.totalHorses} horses</span>}
                  {r.totalPenalties != null && r.totalPenalties > 0 && (
                    <span className="flex items-center gap-1 text-fail"><Gavel size={11} />{r.totalPenalties}</span>
                  )}
                </div>
              </div>
              <Link
                to="/referee/races"
                className="border border-rim bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-rim-hi hover:text-ink"
              >
                Open in Race Control
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}