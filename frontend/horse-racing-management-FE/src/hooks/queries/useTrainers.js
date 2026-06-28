import { useQuery } from '@tanstack/react-query';
import { getTrainerList } from '../../api/trainerApi';

export function useTrainers() {
  const query = useQuery({
    queryKey: ['trainers'],
    queryFn: () => getTrainerList().then((data) => data ?? []),
    staleTime: 5 * 60_000,
  });

  return {
    trainers: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
