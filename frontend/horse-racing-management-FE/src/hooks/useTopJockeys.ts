import { useQuery } from '@tanstack/react-query';
import { getJockeyList, getJockeyProfile } from '@/api/jockeyApi';
import { getErrorMessage } from '@/utils/errors';
import type { Jockey } from '@/types';

/** Top jockeys by win count, for homepage highlights. Fetches the list then each profile for stats. */
export function useTopJockeys(limit = 5) {
  const { data, isLoading, error } = useQuery<Jockey[]>({
    queryKey: ['top-jockeys', limit],
    queryFn: async () => {
      const list = await getJockeyList();
      const profiles = await Promise.all(list.map((jockey) => getJockeyProfile(jockey.id)));
      return profiles
        .sort((a, b) => (b.totalWins ?? 0) - (a.totalWins ?? 0))
        .slice(0, limit);
    },
    staleTime: 5 * 60_000,
  });

  return {
    jockeys: data ?? [],
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Unable to load the jockey list. Please try again.') : null,
  };
}
