import { useState, useEffect } from 'react';
import { getOwnerStats } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import type { HorseOwnerPublicProfile } from '@/types';

export function useHorseOwnerProfile(ownerId?: number) {
  const [owner, setOwner] = useState<HorseOwnerPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (ownerId == null || Number.isNaN(ownerId)) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setError('');
    getOwnerStats(ownerId)
      .then((d) => { if (alive) setOwner(d); })
      .catch((e) => { if (alive) setError(getErrorMessage(e, 'Horse owner not found.')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [ownerId]);

  return { owner, loading, error };
}
