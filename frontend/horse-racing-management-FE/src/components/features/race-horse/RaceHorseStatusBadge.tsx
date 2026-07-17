import Badge from '@/components/ui/Badge';
import { toStatusKey, type RaceHorseStatusKey } from '@/utils/raceHorseStatus';

const CONFIG: Record<RaceHorseStatusKey, { label: string; cls: string }> = {
  PENDING:           { label: 'Pending',            cls: 'bg-warn-subtle text-warn border-warn/30' },
  PENDING_JOCKEY:    { label: 'Awaiting Jockey',    cls: 'bg-warn-subtle text-warn border-warn/30' },
  JOCKEY_REJECTED:   { label: 'Jockey Declined',    cls: 'bg-fail-subtle text-fail border-fail/30' },
  PENDING_ADMIN:     { label: 'Awaiting Approval',  cls: 'bg-warn-subtle text-warn border-warn/30' },
  APPROVED:          { label: 'Approved',           cls: 'bg-ok-subtle   text-ok   border-ok/30'   },
  REJECTED:          { label: 'Rejected',           cls: 'bg-fail-subtle text-fail border-fail/30' },
  WITHDRAW_PENDING:  { label: 'Withdrawal Pending', cls: 'bg-warn-subtle text-warn border-warn/30' },
  WITHDRAW_REJECTED: { label: 'Withdrawal Denied',  cls: 'bg-fail-subtle text-fail border-fail/30' },
  WITHDRAWN:         { label: 'Withdrawn',          cls: 'bg-surface-overlay text-ink-3 border-rim' },
};

export default function RaceHorseStatusBadge({ status }: { status?: string }) {
  const key = toStatusKey(status);
  const cfg = key
    ? CONFIG[key]
    : { label: status ?? '—', cls: 'bg-surface-overlay text-ink-3 border-rim' };
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}