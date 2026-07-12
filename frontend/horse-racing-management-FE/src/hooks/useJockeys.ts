import { useQuery } from '@tanstack/react-query';
import { getJockeyList } from '@/api/jockeyApi';
import { getErrorMessage } from '@/utils/errors';
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
 error: error ? getErrorMessage(error, 'Unable to load the jockey list. Please try again.') : null,
 refetch,
 };
}
