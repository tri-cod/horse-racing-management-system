import { useCallback, useEffect, useState } from 'react';
import { getTrainerProfile, completeTrainerProfile } from '../api/trainerApi';

export function useTrainerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrainerProfile();
      setProfile(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (payload) => {
    const data = await completeTrainerProfile(payload);
    setProfile(data);
    return data;
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { profile, loading, error, refetch: fetch, save };
}