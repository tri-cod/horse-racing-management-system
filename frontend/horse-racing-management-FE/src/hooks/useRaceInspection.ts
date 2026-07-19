import { useState, useEffect, useCallback } from 'react';
import { inspectRace } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import type { PreRaceInspectionResponse } from '@/types';

export function useRaceInspection(raceId: number | null) {
  const [inspection, setInspection] = useState<PreRaceInspectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (raceId == null) return;
    setLoading(true);
    setError('');
    try {
      setInspection(await inspectRace(raceId));
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to inspect race.'));
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    if (raceId == null) {
      setInspection(null);
      return;
    }
    refetch();
  }, [raceId, refetch]);

  return { inspection, loading, error, refetch };
}
