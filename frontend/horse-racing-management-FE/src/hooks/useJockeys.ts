import { useQuery } from '@tanstack/react-query';
import { getJockeyList, getJockeyProfile } from '@/api/jockeyApi';
import { getErrorMessage } from '@/utils/errors';
import type { Jockey } from '@/types';

export function useJockeys() {
 const { data, isLoading, error, refetch } = useQuery<Jockey[]>({
 queryKey: ['jockeys'],
 // GET /jockeys only returns { id, name, dateOfBirth, experienceYear, status } — no
 // avatarUrl/stats. Fetch each profile too so cards can show a real photo and stats.
 queryFn: async () => {
 const list = await getJockeyList();
 return Promise.all(list.map((j) => getJockeyProfile(j.id)));
 },
 staleTime: 5 * 60_000, // jockeys rarely change during a session
 });

 return {
 jockeys: data ?? [],
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Unable to load the jockey list. Please try again.') : null,
 refetch,
 };
}
