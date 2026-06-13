import { useNow } from '../../hooks/useNow';
import { computeRaceStatus, getRaceStatusLabel, getRaceStatusVariant } from '../../utils/raceStatus';
import Badge from '../ui/Badge';

export default function RaceStatusBadge({ race, size = 'md' }) {
  const now = useNow(60_000);
  const status = computeRaceStatus(race, now);

  return (
    <Badge variant={getRaceStatusVariant(status)} size={size}>
      {status === 'ONGOING' && <span className="badge__dot badge__dot--pulse" />}
      {getRaceStatusLabel(status)}
    </Badge>
  );
}
