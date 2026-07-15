import { useQuery } from '@tanstack/react-query';
import { getMyRaceRegistrations } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import type { RaceHorse } from '@/types';

export function useMyRaceRegistrations() {
 const { data, isLoading, error, refetch } = useQuery<RaceHorse[]>({
 queryKey: ['my-registrations'],
 queryFn: getMyRaceRegistrations,
 });

 const registrations = [...(data ?? [])].sort((a, b) => {
 const at = a.registerAt ? new Date(a.registerAt).getTime() : 0;
 const bt = b.registerAt ? new Date(b.registerAt).getTime() : 0;
 return bt - at;
 });

 return {
 registrations,
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Unable to load race registrations. Please try again.') : null,
 refetch,
 };
}
