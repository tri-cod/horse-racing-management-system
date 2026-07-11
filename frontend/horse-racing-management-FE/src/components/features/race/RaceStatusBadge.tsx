import { useNow } from '@/hooks/useNow';
import { computeRaceStatus, getRaceStatusLabel, getRaceStatusVariant } from '@/utils/raceStatus';
import type { Race } from '@/types';

const MANUAL_STATUSES = new Set(['OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'ONGOING', 'FINISHED', 'CANCELLED']);

const VARIANT_CLASSES: Record<string, string> = {
  ocean:   'bg-ok-subtle       text-ok     border border-ok/30',
  warning: 'bg-warn-subtle     text-warn   border border-warn/30',
  danger:  'bg-fail-subtle     text-fail   border border-fail/30',
  neutral: 'bg-surface-overlay text-ink-3  border border-rim',
  dark:    'bg-surface-overlay text-ink-4  border border-rim',
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

  const cls = VARIANT_CLASSES[getRaceStatusVariant(status)] ?? VARIANT_CLASSES.neutral;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cls} ${SIZE[size]}`}>
      {status === 'ONGOING' && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-fail" />
      )}
      {getRaceStatusLabel(status)}
    </span>
  );
}
