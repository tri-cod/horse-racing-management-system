import { useCallback, useEffect, useState } from 'react';
import { getRaceById } from '../api/raceApi';

export function useRaceDetail(id) {
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRaceById(id);
      setRace(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { race, loading, error, refetch: fetch };
}