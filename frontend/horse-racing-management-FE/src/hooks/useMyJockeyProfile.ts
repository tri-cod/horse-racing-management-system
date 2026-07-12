import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyProfile, completeProfile, type CompleteJockeyProfilePayload } from '@/api/jockeyApi';
import { getErrorMessage } from '@/utils/errors';
import type { Jockey } from '@/types';

export function useMyJockeyProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery<Jockey>({
    queryKey: ['my-jockey-profile'],
    queryFn: getMyProfile,
  });

  const save = async (payload: CompleteJockeyProfilePayload): Promise<Jockey> => {
    const updated = await completeProfile(payload);
    queryClient.setQueryData<Jockey>(['my-jockey-profile'], updated);
    return updated;
  };

  return {
    profile: profile ?? null,
    loading: isLoading,
    error: error ? getErrorMessage(error, 'Failed to load jockey profile') : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['my-jockey-profile'] }),
    save,
  };
}
