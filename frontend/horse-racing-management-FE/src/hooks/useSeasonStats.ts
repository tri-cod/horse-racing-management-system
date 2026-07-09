import { useQuery } from '@tanstack/react-query';
import { getRaces } from '@/api/raceApi';
import { getAllHorses } from '@/api/horseApi';
import { getJockeyList } from '@/api/jockeyApi';

interface SeasonStats {
  totalRaces: number;
  totalHorses: number;
  totalJockeys: number;
  totalPrizePool: number;
}

export function useSeasonStats() {
  const { data, isLoading } = useQuery<SeasonStats>({
    queryKey: ['season-stats'],
    queryFn: async () => {
      const [racesPage, horses, jockeys] = await Promise.all([
        getRaces({ page: 0, size: 100 }),
        getAllHorses(),
        getJockeyList(),
      ]);

      const activeHorses = (horses ?? []).filter((h) => (h.status ?? '').toUpperCase() === 'ACTIVE');
      const totalPrizePool = (racesPage.content ?? [])
        .reduce((sum, r) => sum + (Number(r.totalprizepool) || 0), 0);

      return {
        totalRaces: racesPage.totalElements ?? racesPage.content?.length ?? 0,
        totalHorses: activeHorses.length,
        totalJockeys: (jockeys ?? []).length,
        totalPrizePool,
      };
    },
  });

  return {
    stats: data ?? { totalRaces: 0, totalHorses: 0, totalJockeys: 0, totalPrizePool: 0 },
    loading: isLoading,
  };
}