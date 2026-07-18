import { useQuery } from '@tanstack/react-query';
import { getRaces } from '@/api/raceApi';
import type { Race, RaceStatus } from '@/types';

const UPCOMING_STATUSES = new Set<RaceStatus>(['UPCOMING', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'OPEN_BETTING']);

export function useUpcomingRaces(limit = 3) {
 const { data, isLoading, error } = useQuery<Race[]>({
 queryKey: ['upcoming-races', limit],
 queryFn: async () => {
 const page = await getRaces({ page: 0, size: 20 });
 return (page.content ?? [])
 .filter((r) => UPCOMING_STATUSES.has(r.status))
 .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
 .slice(0, limit);
 },
 });

 return {
 races: data ?? [],
 loading: isLoading,
 error: error ? (error as { message?: string }).message ?? 'Failed to load upcoming races' : null,
 };
}
