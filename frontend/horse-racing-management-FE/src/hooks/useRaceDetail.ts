import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRaceById } from '@/api/raceApi';
import { useRaceUpdates } from '@/context/RaceSocketContext';
import type { Race } from '@/types';

export function useRaceDetail(id: number | undefined) {
 const queryClient = useQueryClient();
 const wsUpdates = useRaceUpdates();

 const { data: race, isLoading, error, refetch } = useQuery<Race>({
 queryKey: ['race', id],
 queryFn: () => getRaceById(id!),
 enabled: !!id,
 });

 // Apply real-time status patch from WebSocket without a full refetch
 useEffect(() => {
 if (!id || !wsUpdates) return;
 const upd = wsUpdates.get(String(id));
 if (!upd) return;
 queryClient.setQueryData<Race>(['race', id], (prev) => {
 if (!prev || upd.status === prev.status) return prev;
 return { ...prev, status: upd.status };
 });
 }, [id, wsUpdates, queryClient]);

 return {
 race: race ?? null,
 loading: isLoading,
 error: error ? (error as { message?: string }).message ?? 'Failed to load race' : null,
 refetch,
 };
}
