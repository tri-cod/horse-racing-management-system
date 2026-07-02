import { useQuery } from '@tanstack/react-query';
import { getHorsesByRace } from '@/api/raceHorseApi';
import type { RaceHorse } from '@/types';

export function useHorsesByRace(raceId: number | undefined) {
 const { data, isLoading, error, refetch } = useQuery<RaceHorse[]>({
 queryKey: ['horses-by-race', raceId],
 queryFn: () => getHorsesByRace(raceId!),
 enabled: !!raceId,
 });

 return {
 entries: data ?? [],
 loading: isLoading,
 error: error ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ?? 'Failed to load race entries' : null,
 refetch,
 };
}
