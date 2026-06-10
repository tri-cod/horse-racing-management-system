import { useCallback, useEffect, useState } from 'react';
import { getMyHorses } from '../api/horseOwnerApi';

export function useMyHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHorses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyHorses();
      setHorses(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the horse list. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHorses();
  }, [fetchHorses]);

  return { horses, loading, error, refetch: fetchHorses };
}
