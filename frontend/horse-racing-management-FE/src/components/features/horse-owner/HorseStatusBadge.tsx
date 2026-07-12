import Badge from '@/components/ui/Badge';

const CONFIG: Record<string, { label: string; cls: string }> = {
 ACTIVE: { label: 'Active', cls: 'bg-ok-subtle text-ok border-ok/30' },
 INACTIVE: { label: 'Resting', cls: 'bg-surface-overlay text-ink-3 border-rim' },
 RETIRE: { label: 'Retired', cls: 'bg-warn-subtle text-warn border-warn/30' },
 PENDING: { label: 'Pending', cls: 'bg-warn-subtle text-warn border-warn/30' },
 APPROVED: { label: 'Approved', cls: 'bg-ok-subtle text-ok border-ok/30' },
 REJECTED: { label: 'Rejected', cls: 'bg-fail-subtle text-fail border-fail/30' },
};

export default function HorseStatusBadge({ status }: { status?: string }) {
 const cfg = CONFIG[status ?? ''] ?? { label: status ?? '—', cls: 'bg-surface-overlay text-ink-3 border-rim' };
 return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}
