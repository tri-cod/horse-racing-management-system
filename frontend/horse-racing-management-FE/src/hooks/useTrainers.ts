import { useQuery } from '@tanstack/react-query';
import { getTrainerList } from '@/api/trainerApi';
import { getErrorMessage } from '@/utils/errors';
import type { Trainer } from '@/types';

export function useTrainers() {
 const { data, isLoading, error, refetch } = useQuery<Trainer[]>({
 queryKey: ['trainers'],
 queryFn: getTrainerList,
 });

 return {
 trainers: data ?? [],
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Failed to load trainers') : null,
 refetch,
 };
}
