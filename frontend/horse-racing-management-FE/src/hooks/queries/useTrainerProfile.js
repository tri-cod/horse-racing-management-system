import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrainerProfile, completeTrainerProfile } from '../../api/trainerApi';

export function useTrainerProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['trainer-profile'],
    queryFn: () => getTrainerProfile(),
  });

  const save = useCallback(async (payload) => {
    const data = await completeTrainerProfile(payload);
    queryClient.setQueryData(['trainer-profile'], data);
    return data;
  }, [queryClient]);

  return {
    profile: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
    save,
  };
}
