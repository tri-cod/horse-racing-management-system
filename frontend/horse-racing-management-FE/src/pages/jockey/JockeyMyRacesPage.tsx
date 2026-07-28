import { useState } from 'react';
import { useMyJockeyRaces, type RaceParticipationScope } from '@/hooks/useMyJockeyRaces';
import MyRaceParticipationList from '@/components/features/race/MyRaceParticipationList';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';

const TABS: { key: RaceParticipationScope; label: string }[] = [
  { key: 'current', label: 'Ongoing' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'history', label: 'History' },
];

export default function JockeyMyRacesPage() {
  const [scope, setScope] = useState<RaceParticipationScope>('current');
  const { races, counts, loading, error } = useMyJockeyRaces(scope);

  return (
    <div className="px-8 py-6">
      <DashboardPageHeader eyebrow="Jockey" title="My Races" subtitle="Races you're booked to ride" />

      <div className="mb-5 flex gap-6 border-b border-rim">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setScope(t.key)}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 text-sm font-semibold uppercase tracking-wide transition-colors ${
              scope === t.key ? 'border-gold text-ink' : 'border-transparent text-ink-4 hover:text-ink-2'
            }`}
          >
            {t.label}
            <span
              className={`tnum inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold normal-case tracking-normal ${
                scope === t.key ? 'bg-gold/15 text-gold' : 'bg-surface-overlay text-ink-4'
              }`}
            >
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      <MyRaceParticipationList races={races} loading={loading} error={error} />
    </div>
  );
}
