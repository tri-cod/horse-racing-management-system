import { useQuery } from '@tanstack/react-query';
import { getMyHorses } from '@/api/horseOwnerApi';
import { getErrorMessage } from '@/utils/errors';
import type { Horse } from '@/types';

export function useMyHorses() {
 const { data, isLoading, error, refetch } = useQuery<Horse[]>({
 queryKey: ['my-horses'],
 queryFn: getMyHorses,
 });

 return {
 horses: data ?? [],
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Unable to load the horse list. Please try again.') : null,
 refetch,
 };
}
