import { useState, useEffect, useCallback } from 'react';
import { getMyUpcomingRaces, getMyCurrentRaces, getMyRaceHistory } from '@/api/jockeyApi';
import type { RaceParticipation } from '@/types';

export type RaceParticipationScope = 'upcoming' | 'current' | 'history';

const FETCHERS: Record<RaceParticipationScope, () => Promise<RaceParticipation[]>> = {
  upcoming: getMyUpcomingRaces,
  current: getMyCurrentRaces,
  history: getMyRaceHistory,
};

export function useMyJockeyRaces(scope: RaceParticipationScope) {
  const [byScope, setByScope] = useState<Record<RaceParticipationScope, RaceParticipation[]>>({ upcoming: [], current: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetches all three scopes together, not just the active tab — lets the tab
  // bar show a count per tab, and switching tabs no longer needs a round trip.
  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [upcoming, current, history] = await Promise.all([
        FETCHERS.upcoming(), FETCHERS.current(), FETCHERS.history(),
      ]);
      setByScope({ upcoming: upcoming ?? [], current: current ?? [], history: history ?? [] });
    } catch {
      setError('Failed to load races.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const counts: Record<RaceParticipationScope, number> = {
    upcoming: byScope.upcoming.length, current: byScope.current.length, history: byScope.history.length,
  };

  return { races: byScope[scope], counts, loading, error, refetch };
}
