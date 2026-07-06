import { useQuery } from '@tanstack/react-query';
import { getTrainerList } from '@/api/trainerApi';
import type { Trainer } from '@/types';

export function useTrainers() {
 const { data, isLoading, error, refetch } = useQuery<Trainer[]>({
 queryKey: ['trainers'],
 queryFn: getTrainerList,
 });

 return {
 trainers: data ?? [],
 loading: isLoading,
 error: error ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? 'Failed to load trainers' : null,
 refetch,
 };
}
