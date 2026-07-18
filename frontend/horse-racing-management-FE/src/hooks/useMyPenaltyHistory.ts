import { useState, useEffect, useCallback } from 'react';
import { getMyPenaltyHistory } from '@/api/refereeApi';
import type { Penalty } from '@/types';

export function useMyPenaltyHistory() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPenalties((await getMyPenaltyHistory()) ?? []);
    } catch {
      setError('Failed to load penalty history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { penalties, loading, error, refetch };
}