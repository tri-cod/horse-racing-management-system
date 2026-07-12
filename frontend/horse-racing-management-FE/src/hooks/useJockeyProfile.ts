import { useQuery } from '@tanstack/react-query';
import { getJockeyProfile } from '@/api/jockeyApi';
import { getErrorMessage } from '@/utils/errors';
import type { Jockey } from '@/types';

export function useJockeyProfile(jockeyId: number | undefined) {
  const { data, isLoading, error, refetch } = useQuery<Jockey>({
    queryKey: ['jockey-profile', jockeyId],
    queryFn: () => getJockeyProfile(jockeyId!),
    enabled: !!jockeyId,
  });

  return {
    jockey: data ?? null,
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Unable to load jockey profile. Please try again.') : null,
    refetch,
  };
}
