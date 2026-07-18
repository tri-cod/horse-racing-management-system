import { useState, useEffect, useCallback } from 'react';
import { getMyUpcomingRaces, getMyCurrentRaces, getMyRaceHistory } from '@/api/refereeApi';
import type { RefereeRace } from '@/types';

export type RefereeRaceScope = 'upcoming' | 'current' | 'history';

const FETCHERS: Record<RefereeRaceScope, () => Promise<RefereeRace[]>> = {
  upcoming: getMyUpcomingRaces,
  current: getMyCurrentRaces,
  history: getMyRaceHistory,
};

export function useMyRefereeRaces(scope: RefereeRaceScope) {
  const [races, setRaces] = useState<RefereeRace[]>([]);
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