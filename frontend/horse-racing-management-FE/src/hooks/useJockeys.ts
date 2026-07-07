import { useQuery } from '@tanstack/react-query';
import { getJockeyList } from '@/api/jockeyApi';
import type { Jockey } from '@/types';

export function useJockeys() {
 const { data, isLoading, error, refetch } = useQuery<Jockey[]>({
 queryKey: ['jockeys'],
 queryFn: getJockeyList,
 staleTime: 5 * 60_000, // jockeys rarely change during a session
 });

 return {
 jockeys: data ?? [],
 loading: isLoading,
 error: error ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? 'Unable to load the jockey list. Please try again.' : null,
 refetch,
 };
}
