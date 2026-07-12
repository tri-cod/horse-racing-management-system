import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTrainerProfile, completeTrainerProfile, type CompleteTrainerProfilePayload } from '@/api/trainerApi';
import { getErrorMessage } from '@/utils/errors';
import type { Trainer } from '@/types';

export function useTrainerProfile() {
 const queryClient = useQueryClient();

 const { data: profile, isLoading, error } = useQuery<Trainer>({
 queryKey: ['trainer-profile'],
 queryFn: getTrainerProfile,
 });

 const save = async (payload: CompleteTrainerProfilePayload): Promise<Trainer> => {
 const updated = await completeTrainerProfile(payload);
 queryClient.setQueryData<Trainer>(['trainer-profile'], updated);
 return updated;
 };

 return {
 profile: profile ?? null,
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Failed to load trainer profile') : null,
 refetch: () => queryClient.invalidateQueries({ queryKey: ['trainer-profile'] }),
 save,
 };
}
