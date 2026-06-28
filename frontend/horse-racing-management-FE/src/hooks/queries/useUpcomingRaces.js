import { useQuery } from '@tanstack/react-query';
import { getRaces } from '../../api/raceApi';

const UPCOMING_STATUSES = new Set(['UPCOMING', 'OPEN_REGISTRATION', 'CLOSED_REGISTRATION']);

export function useUpcomingRaces(limit = 3) {
  const query = useQuery({
    queryKey: ['upcoming-races', limit],
    queryFn: async () => {
      const data = await getRaces({ page: 0, size: 20 });
      return (data.content ?? [])
        .filter((r) => UPCOMING_STATUSES.has(r.status?.toUpperCase()))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, limit);
    },
  });

  return {
    races: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
  };
}
