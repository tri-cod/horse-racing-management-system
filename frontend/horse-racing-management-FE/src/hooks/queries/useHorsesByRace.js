import { useQuery } from '@tanstack/react-query';
import { getHorsesByRace } from '../../api/raceHorseApi';

export function useHorsesByRace(raceId) {
  const query = useQuery({
    queryKey: ['horses-by-race', raceId],
    queryFn: () => getHorsesByRace(raceId).then((data) => data ?? []),
    enabled: !!raceId,
  });

  return {
    entries: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
