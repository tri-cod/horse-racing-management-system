import Badge from '@/components/ui/Badge';

const CONFIG: Record<string, { label: string; cls: string }> = {
  // Real backend values (mixed-case)
  PendingJockey:   { label: 'Awaiting Jockey',   cls: 'bg-warn-subtle text-warn border-warn/30' },
  JockeyRejected:  { label: 'Jockey Declined',   cls: 'bg-fail-subtle text-fail border-fail/30' },
  PendingAdmin:    { label: 'Awaiting Approval', cls: 'bg-warn-subtle text-warn border-warn/30' },
  Approved:        { label: 'Approved',          cls: 'bg-ok-subtle   text-ok   border-ok/30'   },
  WithdrawPending: { label: 'Withdrawal Pending', cls: 'bg-warn-subtle text-warn border-warn/30' },
  Rejected:        { label: 'Rejected',          cls: 'bg-fail-subtle text-fail border-fail/30' },
  // Legacy/uppercase fallbacks, kept for safety
  PENDING:  { label: 'Pending',  cls: 'bg-warn-subtle  text-warn  border-warn/30'  },
  APPROVED: { label: 'Approved', cls: 'bg-ok-subtle    text-ok    border-ok/30'    },
  REJECTED: { label: 'Rejected', cls: 'bg-fail-subtle  text-fail  border-fail/30'  },
};

export default function RaceHorseStatusBadge({ status }: { status?: string }) {
  const cfg = CONFIG[status ?? ''] ?? {
    label: status ?? '—',
    cls: 'bg-surface-overlay text-ink-3 border-rim',
  };
  return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}
