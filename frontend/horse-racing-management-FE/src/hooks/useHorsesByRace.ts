import { useQuery } from '@tanstack/react-query';
import { getHorsesByRace } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import type { RaceHorse } from '@/types';

export function useHorsesByRace(raceId: number | undefined, options?: { refetchInterval?: number }) {
 const { data, isLoading, error, refetch } = useQuery<RaceHorse[]>({
 queryKey: ['horses-by-race', raceId],
 queryFn: () => getHorsesByRace(raceId!),
 enabled: !!raceId,
 // Opt-in only (e.g. the admin entries screen) — polling every list that uses
 // this hook would be wasteful for pages that don't need live updates.
 refetchInterval: options?.refetchInterval,
 });

 return {
 entries: data ?? [],
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Failed to load race entries') : null,
 refetch,
 };
}
