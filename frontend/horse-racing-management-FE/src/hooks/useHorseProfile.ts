import { useHorses } from '@/hooks/useHorses';

export function useHorseProfile(horseId: number | undefined) {
  const { horses, loading, error, refetch } = useHorses();
  const horse = horses.find((h) => h.horseId === horseId) ?? null;

  return { horse, loading, error, refetch };
}