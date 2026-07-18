import { useState, useEffect } from 'react';
import { getRefereeProfile } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import type { RefereeProfile } from '@/types';

export function useRefereeProfile(refereeId?: number) {
  const [referee, setReferee] = useState<RefereeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (refereeId == null || Number.isNaN(refereeId)) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setError('');
    getRefereeProfile(refereeId)
      .then((d) => { if (alive) setReferee(d); })
      .catch((e) => { if (alive) setError(getErrorMessage(e, 'Referee not found.')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [refereeId]);

  return { referee, loading, error };
}
