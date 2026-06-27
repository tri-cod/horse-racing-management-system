import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRaces } from '../../api/raceApi';
import { useRaceUpdates } from '../../context/RaceSocketContext';

export function useRaces({ page = 0, size = 9 } = {}) {
  const queryClient = useQueryClient();
  const wsUpdates = useRaceUpdates();

  const query = useQuery({
    queryKey: ['races', { page, size }],
    queryFn: () => getRaces({ page, size }),
  });

  // Apply real-time status patches from WebSocket without triggering a refetch
  useEffect(() => {
    if (!wsUpdates || wsUpdates.size === 0) return;
    queryClient.setQueryData(['races', { page, size }], (old) => {
      if (!old) return old;
      return {
        ...old,
        content: old.content.map((r) => {
          const upd = wsUpdates.get(String(r.id));
          if (!upd || upd.status === r.status) return r;
          return { ...r, status: upd.status };
        }),
      };
    });
  }, [wsUpdates, queryClient, page, size]);

  return {
    races: query.data?.content ?? [],
    totalPages: query.data?.totalPages ?? 0,
    totalElements: query.data?.totalElements ?? 0,
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
