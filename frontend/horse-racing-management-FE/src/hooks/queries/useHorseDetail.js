import { useQuery } from '@tanstack/react-query';
import { getHorseById } from '../../api/horseOwnerApi';

export function useHorseDetail(horseId) {
  const query = useQuery({
    queryKey: ['horse', horseId],
    queryFn: () => getHorseById(horseId),
    enabled: !!horseId,
  });

  return {
    horse: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
