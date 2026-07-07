import { useQuery } from '@tanstack/react-query';
import { getHorseById } from '@/api/horseOwnerApi';
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
 error: error ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? 'Unable to load horse information. Please try again.' : null,
 refetch,
 };
}
