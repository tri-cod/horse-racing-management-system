import type { BetStatus } from '@/types';

const CONFIG: Record<string, { label: string; cls: string }> = {
 WON: { label: 'Won', cls: 'bg-green-100 text-green-700 border border-green-200' },
 LOST: { label: 'Lost', cls: 'bg-red-100 text-red-700 border border-red-200' },
 PENDING: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
 PENDING_FINISHED: { label: 'Pending Result', cls: '' },
 CANCELLED: { label: 'Cancelled', cls: '' },
};

export default function BetStatusBadge({ status }: { status: BetStatus | string }) {
 const cfg = CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' };
 return (
 <span className="">
 {cfg.label}
 </span>
 );
}
