import { useState, useEffect, useCallback } from 'react';
import { getMyRefereeProfile, completeRefereeProfile } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import type { RefereeProfile, CompleteRefereeProfilePayload } from '@/types';

export function useMyRefereeProfile() {
  const [profile, setProfile] = useState<RefereeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfile(await getMyRefereeProfile());
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (payload: CompleteRefereeProfilePayload) => {
    const updated = await completeRefereeProfile(payload);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, error, refetch, save };
}