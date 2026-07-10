import { useJockeys } from '@/hooks/useJockeys';

export function useJockeyProfile(jockeyId: number | undefined) {
  const { jockeys, loading, error, refetch } = useJockeys();
  const jockey = jockeys.find((j) => j.id === jockeyId) ?? null;

  return { jockey, loading, error, refetch };
}
