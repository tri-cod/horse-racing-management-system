import { useQuery } from '@tanstack/react-query';
import { getMyRaceRegistrations } from '../../api/raceHorseApi';

export function useMyRaceRegistrations() {
  const query = useQuery({
    queryKey: ['my-race-registrations'],
    queryFn: () => getMyRaceRegistrations().then((data) => data ?? []),
  });

  return {
    registrations: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.response?.data?.message || query.error?.message || null,
    refetch: query.refetch,
  };
}
