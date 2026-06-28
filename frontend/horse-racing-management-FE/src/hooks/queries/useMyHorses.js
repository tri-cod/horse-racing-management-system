import { useQuery } from '@tanstack/react-query';
import { getMyHorses } from '../../api/horseOwnerApi';

export function useMyHorses() {
  const query = useQuery({
    queryKey: ['my-horses'],
    queryFn: () => getMyHorses().then((data) => data ?? []),
  });

  return {
    horses: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
