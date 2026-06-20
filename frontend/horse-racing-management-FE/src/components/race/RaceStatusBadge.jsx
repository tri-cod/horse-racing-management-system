import { useNow } from '../../hooks/useNow';
import { computeRaceStatus, getRaceStatusLabel, getRaceStatusVariant } from '../../utils/raceStatus';
import Badge from '../ui/Badge';

export default function RaceStatusBadge({ race, size = 'md' }) {
  const now = useNow(60_000);

  // Use race.status from API if set manually by admin/system
  // only fallback to computeRaceStatus when status is UPCOMING (time-based)
  const MANUAL_STATUSES = ['OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'ONGOING', 'FINISHED', 'CANCELLED'];
  const status = MANUAL_STATUSES.includes(race?.status)
    ? race.status
    : computeRaceStatus(race, now);

  return (
    <Badge variant={getRaceStatusVariant(status)} size={size}>
      {status === 'ONGOING' && <span className="badge__dot badge__dot--pulse" />}
      {getRaceStatusLabel(status)}
    </Badge>
  );
}