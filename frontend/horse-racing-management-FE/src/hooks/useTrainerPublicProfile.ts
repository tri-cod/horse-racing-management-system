import { useEffect, useState } from 'react';
import { getTrainerStats, getTrainerHorses } from '@/api/trainerApi';
import { getErrorMessage } from '@/utils/errors';
import type { TrainerStats, TrainerHorse } from '@/types';

export function useTrainerPublicProfile(trainerId?: number) {
  const [trainer, setTrainer] = useState<TrainerStats | null>(null);
  const [horses, setHorses] = useState<TrainerHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trainerId == null || Number.isNaN(trainerId)) { setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([getTrainerStats(trainerId), getTrainerHorses(trainerId).catch(() => [])])
      .then(([stats, trainerHorses]) => {
        if (!alive) return;
        setTrainer(stats);
        setHorses(trainerHorses ?? []);
      })
      .catch((e) => { if (alive) setError(getErrorMessage(e, 'Trainer not found.')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [trainerId]);

  return { trainer, horses, loading, error };
}
