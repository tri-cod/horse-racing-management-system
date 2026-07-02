import { useQuery } from '@tanstack/react-query';
import { getRaceResults } from '@/api/refereeApi';
import type { RaceResultNested } from '@/types';

export interface NormalizedRaceResult {
  id: number;
  position: number;
  horseName: string;
  jockeyName: string;
  time?: string;
  odds?: number;
}

function fmtSeconds(seconds?: number): string | undefined {
  if (seconds == null) return undefined;
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function normalize(r: RaceResultNested): NormalizedRaceResult {
  return {
    id: r.id,
    position: r.finishPosition ?? r.rank ?? 0,
    horseName: r.raceHorse?.horse?.horseName ?? '—',
    jockeyName: r.raceHorse?.jockey?.user?.fullName ?? '—',
    time: fmtSeconds(r.completionTimeSeconds),
    odds: r.raceHorse?.odds,
  };
}

export function useRaceResults(raceId: number | undefined) {
  const { data, isLoading, error } = useQuery<RaceResultNested[]>({
    queryKey: ['race-results', raceId],
    queryFn: () => getRaceResults(raceId!) as unknown as Promise<RaceResultNested[]>,
    enabled: !!raceId,
    staleTime: 60_000,
  });

  const normalized = (data ?? [])
    .map(normalize)
    .sort((a, b) => a.position - b.position);

  return {
    results: normalized,
    loading: isLoading,
    error: error ? (error as { message?: string }).message ?? 'Failed to load results' : null,
  };
}
