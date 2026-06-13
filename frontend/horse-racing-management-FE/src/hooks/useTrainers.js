import { useCallback, useEffect, useState } from 'react';
import { getTrainerList } from '../api/trainerApi';

export function useTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrainerList();
      setTrainers(data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { trainers, loading, error, refetch: fetch };
}
