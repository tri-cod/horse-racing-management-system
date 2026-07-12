import Badge from '@/components/ui/Badge';
import type { BetStatus } from '@/types';

const CONFIG: Record<string, { label: string; cls: string }> = {
 WON: { label: 'Won', cls: 'bg-green-100 text-green-700 border-green-200' },
 LOST: { label: 'Lost', cls: 'bg-red-100 text-red-700 border-red-200' },
 PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
 PENDING_FINISHED: { label: 'Pending Result', cls: 'bg-surface-overlay text-ink-3 border-rim' },
 CANCELLED: { label: 'Cancelled', cls: 'bg-surface-overlay text-ink-3 border-rim' },
};

export default function BetStatusBadge({ status }: { status: BetStatus | string }) {
 const cfg = CONFIG[status] ?? { label: status, cls: 'bg-surface-overlay text-ink-3 border-rim' };
 return <Badge className={cfg.cls}>{cfg.label}</Badge>;
}
