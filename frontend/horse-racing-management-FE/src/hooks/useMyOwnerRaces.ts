import { useState, useEffect, useCallback } from 'react';
import { getMyUpcomingRaces, getMyCurrentRaces, getMyRaceHistory } from '@/api/horseOwnerApi';
import type { RaceParticipation } from '@/types';

export type RaceParticipationScope = 'upcoming' | 'current' | 'history';

const FETCHERS: Record<RaceParticipationScope, () => Promise<RaceParticipation[]>> = {
  upcoming: getMyUpcomingRaces,
  current: getMyCurrentRaces,
  history: getMyRaceHistory,
};

export function useMyOwnerRaces(scope: RaceParticipationScope) {
  const [races, setRaces] = useState<RaceParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRaces((await FETCHERS[scope]()) ?? []);
    } catch {
      setError('Failed to load races.');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { refetch(); }, [refetch]);

  return { races, loading, error, refetch };
}
