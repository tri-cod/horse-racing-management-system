import { useQuery } from '@tanstack/react-query';
import { getRaces } from '@/api/raceApi';
import type { Race } from '@/types';

export function useLatestFinishedRace() {
  const { data, isLoading, error } = useQuery<Race | null>({
    queryKey: ['latest-finished-race'],
    queryFn: async () => {
      const page = await getRaces({ page: 0, size: 50 });
      const finished = (page.content ?? [])
        .filter((r) => r.status === 'FINISHED')
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      return finished[0] ?? null;
    },
  });

  return {
    race: data ?? null,
    loading: isLoading,
    error: error ? (error as { message?: string }).message ?? 'Failed to load latest race' : null,
  };
}