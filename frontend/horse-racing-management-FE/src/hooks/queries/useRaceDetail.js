import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRaceById } from '../../api/raceApi';
import { useRaceUpdates } from '../../context/RaceSocketContext';

export function useRaceDetail(id) {
  const queryClient = useQueryClient();
  const wsUpdates = useRaceUpdates();

  const query = useQuery({
    queryKey: ['race', id],
    queryFn: () => getRaceById(id),
    enabled: !!id,
  });

  // Apply real-time status patch from WebSocket without triggering a refetch
  useEffect(() => {
    if (!id || !wsUpdates) return;
    const upd = wsUpdates.get(String(id));
    if (!upd) return;
    queryClient.setQueryData(['race', id], (old) => {
      if (!old || upd.status === old.status) return old;
      return { ...old, status: upd.status };
    });
  }, [id, wsUpdates, queryClient]);

  return {
    race: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
