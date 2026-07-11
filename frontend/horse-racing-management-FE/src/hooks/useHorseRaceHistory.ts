import { useQuery } from '@tanstack/react-query';
import { getHorseRaceHistory, getHorseBestResult } from '@/api/refereeApi';
import type { HorseRaceHistoryItem } from '@/types';

export function useHorseRaceHistory(horseId: number | undefined) {
  const { data, isLoading, error } = useQuery<HorseRaceHistoryItem[]>({
    queryKey: ['horse-race-history', horseId],
    queryFn: () => getHorseRaceHistory(horseId!),
    enabled: !!horseId,
    staleTime: 60_000,
  });

  const { data: best } = useQuery<HorseRaceHistoryItem | null>({
    queryKey: ['horse-best-result', horseId],
    queryFn: () => getHorseBestResult(horseId!),
    enabled: !!horseId,
    staleTime: 60_000,
  });

  const history = (data ?? []).slice().sort((a, b) => {
    const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
    const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
    return tb - ta; // most recent race first
  });

  const totalRewards = history.reduce((sum, item) => sum + (item.rewards ?? 0), 0);
  const wins = history.filter((item) => item.rank === 1).length;

  return {
    history,
    best: best ?? null,
    totalRewards,
    wins,
    racesRun: history.length,
    loading: isLoading,
    error: error ? (error as { message?: string }).message ?? 'Failed to load race history' : null,
  };
}