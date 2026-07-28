import { useQuery } from '@tanstack/react-query';
import { getHorseCareerStats } from '@/api/refereeApi';
import type { HorseCareerStats } from '@/types';

export function useHorseCareerStats(horseId: number | undefined) {
  const { data, isLoading, error } = useQuery<HorseCareerStats>({
    queryKey: ['horse-career-stats', horseId],
    queryFn: () => getHorseCareerStats(horseId!),
    enabled: !!horseId,
    staleTime: 60_000,
  });

  return {
    stats: data ?? null,
    loading: isLoading,
    error: error ? (error as { message?: string }).message ?? 'Failed to load career stats' : null,
  };
}
