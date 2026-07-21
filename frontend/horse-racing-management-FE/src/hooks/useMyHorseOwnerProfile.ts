import { useState, useEffect, useCallback } from 'react';
import { getMyProfile, completeProfile } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import type { HorseOwnerProfile, CompleteHorseOwnerProfilePayload } from '@/types';

export function useMyHorseOwnerProfile() {
  const [profile, setProfile] = useState<HorseOwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfile(await getMyProfile());
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (payload: CompleteHorseOwnerProfilePayload) => {
    const updated = await completeProfile(payload);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, refetch, save };
}
