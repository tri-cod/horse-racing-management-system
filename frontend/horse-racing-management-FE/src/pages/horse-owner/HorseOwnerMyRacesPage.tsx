import { useState } from 'react';
import { useMyOwnerRaces, type RaceParticipationScope } from '@/hooks/useMyOwnerRaces';
import MyRaceParticipationList from '@/components/features/race/MyRaceParticipationList';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

const TABS: { key: RaceParticipationScope; label: string }[] = [
  { key: 'current', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

export default function HorseOwnerMyRacesPage() {
  const [scope, setScope] = useState<RaceParticipationScope>('current');
  const { races, loading, error } = useMyOwnerRaces(scope);

  return (
    <div className="px-8 py-6">
      <Seo title="My Races" description="Races your horses are entered in, past and upcoming." />
      <DashboardPageHeader eyebrow="Horse Owner" title="My Races" subtitle="Races your horses are entered in" />

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

      <MyRaceParticipationList races={races} loading={loading} error={error} />
    </div>
  );
}
