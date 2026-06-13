import { useCallback, useEffect, useState } from 'react';
import { getHorsesByRace } from '../api/raceHorseApi';

export function useHorsesByRace(raceId) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!raceId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getHorsesByRace(raceId);
      setEntries(data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, loading, error, refetch: fetch };
}
