import { useQuery } from '@tanstack/react-query';
import { getMyRaceRegistrations } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import type { RaceHorse } from '@/types';

export function useMyRaceRegistrations() {
 const { data, isLoading, error, refetch } = useQuery<RaceHorse[]>({
 queryKey: ['my-registrations'],
 queryFn: getMyRaceRegistrations,
 });

 return {
 registrations: data ?? [],
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Unable to load race registrations. Please try again.') : null,
 refetch,
 };
}
