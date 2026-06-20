import { useCallback, useEffect, useState } from 'react';
import { getRaces } from '../api/raceApi';

// Statuses considered "upcoming" by the backend
const UPCOMING_STATUSES = new Set(['UPCOMING', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION']);

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
      // Use actual status from backend instead of computing from time,
      // avoids the case where referee starts a race early but homepage still shows it as Upcoming
      const upcoming = all
        .filter((r) => UPCOMING_STATUSES.has(r.status?.toUpperCase()))
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