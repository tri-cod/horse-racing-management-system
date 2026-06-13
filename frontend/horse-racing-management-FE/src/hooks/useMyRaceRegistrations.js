import { useCallback, useEffect, useState } from 'react';
import { getMyRaceRegistrations } from '../api/raceHorseApi';

export function useMyRaceRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyRaceRegistrations();
      setRegistrations(data ?? []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { registrations, loading, error, refetch: fetch };
}