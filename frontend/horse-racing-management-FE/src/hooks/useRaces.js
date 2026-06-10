import { useCallback, useEffect, useState } from 'react';
import { getRaces } from '../api/raceApi';

export function useRaces({ page = 0, size = 9 } = {}) {
  const [races, setRaces] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRaces({ page, size });
      setRaces(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { races, totalPages, totalElements, loading, error, refetch: fetch };
}
