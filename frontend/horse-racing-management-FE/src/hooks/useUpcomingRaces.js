import { useCallback, useEffect, useState } from 'react';
import { getRaces } from '../api/raceApi';
import { computeRaceStatus } from '../utils/raceStatus';

export function useUpcomingRaces(limit = 3) {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRaces({ page: 0, size: 20 });
      const all = data.content ?? [];
      const now = new Date();
      const upcoming = all
        .filter((r) => computeRaceStatus(r, now) === 'UPCOMING')
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, limit);
      setRaces(upcoming);
    } catch (e) {
      console.error('Failed to load upcoming races:', e);
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { races, loading, error };
}
