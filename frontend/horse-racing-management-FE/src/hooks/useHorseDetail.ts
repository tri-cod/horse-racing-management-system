import { useQuery } from '@tanstack/react-query';
import { getHorseById } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import type { Horse } from '@/types';

export function useHorseDetail(horseId: number | undefined) {
 const { data, isLoading, error, refetch } = useQuery<Horse>({
 queryKey: ['horse', horseId],
 queryFn: () => getHorseById(horseId!),
 enabled: !!horseId,
 });

 return {
 horse: data ?? null,
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Unable to load horse information. Please try again.') : null,
 refetch,
 };
}
