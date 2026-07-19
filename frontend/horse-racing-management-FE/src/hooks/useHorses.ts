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

  // Public directory shows every horse still part of the current stable.
  // Only RETIRED horses are hidden; ACTIVE, RACING, FINISHED, and INACTIVE
  // all remain visible to the public.
  const visibleHorses = (data ?? []).filter(
    (h) => (h.status ?? '').toUpperCase() !== 'RETIRED',
  );

  return {
    horses: visibleHorses,
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Unable to load the horse list. Please try again.') : null,
    refetch,
  };
}