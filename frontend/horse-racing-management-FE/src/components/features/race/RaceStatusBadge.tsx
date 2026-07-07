import { useNow } from '@/hooks/useNow';
import { computeRaceStatus, getRaceStatusLabel } from '@/utils/raceStatus';
import type { Race } from '@/types';

const MANUAL_STATUSES = new Set(['OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'ONGOING', 'FINISHED', 'CANCELLED']);

const CONFIG: Record<string, string> = {
  UPCOMING:            'bg-blue/10       text-blue   border border-blue/30',
  OPEN_REGISTRATION:   'bg-ok-subtle     text-ok     border border-ok/30',
  CLOSED_REGISTRATION: 'bg-warn-subtle   text-warn   border border-warn/30',
  ONGOING:             'bg-fail-subtle   text-fail   border border-fail/30',
  FINISHED:            'bg-surface-overlay text-ink-3 border border-rim',
  COMPLETED:           'bg-surface-overlay text-ink-3 border border-rim',
  CANCELLED:           'bg-surface-overlay text-ink-4 border border-rim',
  UNKNOWN:             'bg-surface-overlay text-ink-4 border border-rim',
};

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2    py-0.5 text-[10px]',
  md: 'px-2.5  py-0.5 text-xs',
  lg: 'px-3    py-1   text-sm',
};

export default function RaceStatusBadge({ race, size = 'md' }: { race: Race | null; size?: 'sm' | 'md' | 'lg' }) {
  const now = useNow(60_000);
  const status = race && MANUAL_STATUSES.has(race.status)
    ? race.status
    : computeRaceStatus(race, now);

  const cls = CONFIG[status] ?? CONFIG.UNKNOWN;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cls} ${SIZE[size]}`}>
      {status === 'ONGOING' && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fail" />
      )}
      {getRaceStatusLabel(status)}
    </span>
  );
}
