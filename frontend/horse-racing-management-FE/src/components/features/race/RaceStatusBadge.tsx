import Badge from '@/components/ui/Badge';
import { useNow } from '@/hooks/useNow';
import { computeRaceStatus, getRaceStatusLabel, getRaceStatusVariant } from '@/utils/raceStatus';
import type { Race } from '@/types';

const MANUAL_STATUSES = new Set([
  'OPEN_REGISTRATION',
  'CLOSED_REGISTRATION',
  'OPEN_BETTING',
  'ONGOING',
  'FINISHED',
  'CANCELLED',
]);
export default function RaceStatusBadge({ race, size = 'md' }: { race: Race | null; size?: 'sm' | 'md' | 'lg' }) {
  const now = useNow(60_000);
  const status = race && MANUAL_STATUSES.has(race.status)
    ? race.status
    : computeRaceStatus(race, now);

  return (
    <Badge variant={getRaceStatusVariant(status)} size={size}>
      {status === 'ONGOING' && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fail" />
      )}
      {getRaceStatusLabel(status)}
    </Badge>
  );
}
