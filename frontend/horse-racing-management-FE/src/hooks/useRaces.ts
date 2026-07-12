import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRaces } from '@/api/raceApi';
import { useRaceUpdates } from '@/context/RaceSocketContext';
import { getErrorMessage } from '@/utils/errors';
import type { PageResponse, Race } from '@/types';

interface UseRacesOptions {
 page?: number;
 size?: number;
}

export function useRaces({ page = 0, size = 9 }: UseRacesOptions = {}) {
 const queryClient = useQueryClient();
 const wsUpdates = useRaceUpdates();

 const { data, isLoading, error, refetch } = useQuery<PageResponse<Race>>({
 queryKey: ['races', page, size],
 queryFn: () => getRaces({ page, size }),
 });

 // Apply real-time status patches from WebSocket without a full refetch
 useEffect(() => {
 if (!wsUpdates || wsUpdates.size === 0) return;
 queryClient.setQueryData<PageResponse<Race>>(['races', page, size], (old) => {
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
 races: data?.content ?? [],
 totalPages: data?.totalPages ?? 0,
 totalElements: data?.totalElements ?? 0,
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Failed to load races') : null,
 refetch,
 };
}
