import { Users } from 'lucide-react';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import EmptyState from '@/components/ui/EmptyState';
import { assignLanes } from '@/utils/laneUtils';

interface RegisteredHorsesListProps {
  raceId: number;
}

export default function RegisteredHorsesList({ raceId }: RegisteredHorsesListProps) {
  const { entries: allEntries, loading, error } = useHorsesByRace(raceId);
  const entries = assignLanes(
    allEntries.filter((e) => e.status?.toLowerCase() === 'approved') as Parameters<typeof assignLanes>[0],
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-24 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-fail">{error}</p>;
  }

  if (!entries.length) {
    return <EmptyState icon={Users} title="No horses registered" subtitle="No approved horses for this race yet." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px]">
        <thead>
          <tr className="border-b border-rim">
            {['Lane', 'Horse', 'Owner', 'Jockey', 'Odds'].map((h) => (
              <th key={h} className="pb-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rim">
          {entries.map((e) => (
            <tr key={e.id} className="transition-colors hover:bg-surface-overlay/30">
              <td className="py-2.5 pr-4">
                <span className="tnum inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                  {e.laneNumber ?? ''}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-sm font-semibold text-ink">{e.horseName}</td>
              <td className="py-2.5 pr-4 text-sm text-ink-3">{e.ownerName ?? ''}</td>
              <td className="py-2.5 pr-4 text-sm text-ink-3">{e.jockeyName ?? ''}</td>
              <td className="tnum py-2.5 pr-4 text-sm font-semibold text-ink">
                {e.odds != null ? `×${Number(e.odds).toFixed(2)}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
