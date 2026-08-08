import { useState, useEffect, useCallback } from 'react';
import { getRaceHandicap } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import type { RaceHandicapResponse } from '@/types';

export function useRaceHandicap(raceId: number | null) {
  const [handicap, setHandicap] = useState<RaceHandicapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    if (raceId == null) return;
    setLoading(true);
    setError('');
    try {
      setHandicap(await getRaceHandicap(raceId));
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load handicap.'));
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    if (raceId == null) {
      setHandicap(null);
      return;
    }
    refetch();
  }, [raceId, refetch]);

  return { handicap, loading, error, refetch };
}
