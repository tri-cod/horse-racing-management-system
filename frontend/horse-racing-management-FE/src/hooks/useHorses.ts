import { useQuery } from '@tanstack/react-query';
import { getAllHorses } from '@/api/horseApi';
import { getErrorMessage } from '@/utils/errors';
import type { HorseCurrentStatusResponse } from '@/types';

export function useHorses() {
  const { data, isLoading, error, refetch } = useQuery<HorseCurrentStatusResponse[]>({
    queryKey: ['horses'],
    queryFn: getAllHorses,
    staleTime: 60_000,
  });

  const activeHorses = (data ?? []).filter((h) => (h.status ?? '').toUpperCase() === 'ACTIVE');

  return {
    horses: activeHorses,  
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Unable to load the horse list. Please try again.') : null,
    refetch,
  };
}