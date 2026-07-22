import { useQuery } from '@tanstack/react-query';
import { getRaceResults } from '@/api/refereeApi';
import { getHorsesByRace } from '@/api/raceHorseApi';
import type { RaceResultFlat } from '@/types';

export interface NormalizedRaceResult {
  id: number;
  position: number;
  horseId?: number;
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

// GET /race-results/race/{raceId} returns a FLAT DTO (horseName/jockeyName directly
// on the object, no `raceHorse.horse.*` nesting, and no `odds`) — odds is backfilled
// by cross-referencing the race's entries (/race-horse/race/{raceId}) by horseId.
function normalize(r: RaceResultFlat, oddsByHorseId: Map<number, number>): NormalizedRaceResult {
  return {
    id: r.id,
    position: r.rank ?? 0,
    horseId: r.horseId,
    horseName: r.horseName ?? '—',
    jockeyName: r.jockeyName ?? '—',
    time: r.completionTimeFormatted ?? fmtSeconds(r.completionTimeSeconds),
    odds: r.horseId != null ? oddsByHorseId.get(r.horseId) : undefined,
  };
}

export function useRaceResults(raceId: number | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['race-results', raceId],
    queryFn: async () => {
      const [results, raceHorses] = await Promise.all([
        getRaceResults(raceId!) as unknown as Promise<RaceResultFlat[]>,
        getHorsesByRace(raceId!),
      ]);
      return { results: results ?? [], raceHorses: raceHorses ?? [] };
    },
    enabled: !!raceId,
    staleTime: 60_000,
  });

  const oddsByHorseId = new Map(
    (Array.isArray(data?.raceHorses) ? data.raceHorses : [])
      .filter((e) => e.odds != null)
      .map((e) => [e.horseId, e.odds as number]),
  );

  const normalized = (data?.results ?? [])
    .map((r) => normalize(r, oddsByHorseId))
    .sort((a, b) => a.position - b.position);

  return {
    results: normalized,
    loading: isLoading,
    error: error ? (error as { message?: string }).message ?? 'Failed to load results' : null,
  };
}
