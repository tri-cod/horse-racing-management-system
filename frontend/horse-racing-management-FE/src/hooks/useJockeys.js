import { useCallback, useEffect, useState } from 'react';
import { getJockeyList } from '../api/jockeyApi';

let cachedJockeys = null;

export function useJockeys() {
  const [jockeys, setJockeys] = useState(cachedJockeys || []);
  const [loading, setLoading] = useState(!cachedJockeys);
  const [error, setError] = useState(null);

  const fetchJockeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJockeyList();
      cachedJockeys = data;
      setJockeys(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load the jockey list. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cachedJockeys) {
      fetchJockeys();
    }
  }, [fetchJockeys]);

  return { jockeys, loading, error, refetch: fetchJockeys };
}
