import { useQuery } from '@tanstack/react-query';
import { getAllReferees } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import type { RefereeProfile } from '@/types';

export function useReferees() {
  const { data, isLoading, error, refetch } = useQuery<RefereeProfile[]>({
    queryKey: ['referees'],
    queryFn: getAllReferees,
    staleTime: 5 * 60_000,
  });

  return {
    referees: data ?? [],
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Unable to load the referee list.') : null,
    refetch,
  };
}
