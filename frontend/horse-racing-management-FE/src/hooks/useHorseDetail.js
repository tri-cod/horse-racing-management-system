import { useCallback, useEffect, useState } from 'react';
import { getHorseById } from '../api/horseOwnerApi';

export function useHorseDetail(horseId) {
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHorse = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHorseById(horseId);
      setHorse(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load horse information. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [horseId]);

  useEffect(() => {
    fetchHorse();
  }, [fetchHorse]);

  return { horse, loading, error, refetch: fetchHorse };
}
