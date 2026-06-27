import { useQuery } from '@tanstack/react-query';
import { getJockeyList } from '../../api/jockeyApi';

export function useJockeys() {
  const query = useQuery({
    queryKey: ['jockeys'],
    queryFn: () => getJockeyList(),
    staleTime: 5 * 60_000, // jockey list changes infrequently
  });

  return {
    jockeys: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
