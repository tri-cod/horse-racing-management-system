import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { isStatus } from '@/utils/trainingContractStatus';
import type { TrainingContract } from '@/types';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const fmtFee = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n))
    : '';

const STATUS_CLS: Record<string, string> = {
  PENDING: 'bg-warn-subtle text-warn border-warn/30',
  ACTIVE: 'bg-ok-subtle text-ok border-ok/30',
  REJECTED: 'bg-fail-subtle text-fail border-fail/30',
  CANCELLED: 'bg-surface-overlay text-ink-3 border-rim',
  COMPLETED: 'bg-gold/10 text-gold border-gold/30',
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
};

// Compute progress from the dates directly — the backend's progressPercent is
// derived from Period.getDays() (day component only), so it under-reports for
// multi-month contracts. Recomputing here keeps the bar honest.
function computeProgress(c: TrainingContract): { pct: number; daysLeft: number } | null {
  if (!c.startDate || !c.endDate) return null;
  const start = new Date(c.startDate).getTime();
  const end = new Date(c.endDate).getTime();
  const now = Date.now();
  if (end <= start) return null;
  const total = end - start;
  const passed = Math.min(Math.max(now - start, 0), total);
  const pct = Math.round((passed / total) * 100);
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86_400_000));
  return { pct, daysLeft };
}

interface Props {
  contracts: TrainingContract[];
  // 'owner' shows the Trainer column; 'trainer' shows the Owner column (with
  // their note). All state changes happen on the contract detail page.
  perspective: 'owner' | 'trainer';
}

export default function TrainingContractsTable({ contracts, perspective }: Props) {
  const isTrainer = perspective === 'trainer';
  const counterpartyHeader = isTrainer ? 'Owner' : 'Trainer';

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-b border-rim bg-surface-overlay">
            {['Horse', counterpartyHeader, 'Period', 'Fee', 'Status', 'Actions'].map((h) => (
              <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rim">
          {contracts.map((c) => {
            const initial = c.horseName?.charAt(0)?.toUpperCase() ?? '?';
            const progress = isStatus(c.status, 'ACTIVE') ? computeProgress(c) : null;
            return (
              <tr key={c.id} className="transition-colors hover:bg-surface-overlay/40">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    {c.horseAvatarUrl ? (
                      <img src={c.horseAvatarUrl} alt={c.horseName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                        {initial}
                      </div>
                    )}
                    <span className="font-serif text-sm font-bold text-ink">{c.horseName ?? `Horse #${c.horseId}`}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-sm text-ink-2">
                    {isTrainer
                      ? (c.ownerName ?? `Owner #${c.ownerId}`)
                      : (c.trainerName ?? `Trainer #${c.trainerId}`)}
                  </p>
                  {/* Owner's note gives the trainer context when deciding. */}
                  {isTrainer && c.ownerNote && (
                    <p className="mt-0.5 max-w-xs truncate text-[11px] text-ink-4" title={c.ownerNote}>{c.ownerNote}</p>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <p className="tnum text-sm text-ink-2">{fmtDate(c.startDate)} → {fmtDate(c.endDate)}</p>
                  {progress && (
                    <div className="mt-1.5 w-40">
                      <div className="h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                        <div className="h-full rounded-full bg-gold" style={{ width: `${progress.pct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] font-medium text-ink-4">
                        {progress.pct}% · {progress.daysLeft} day{progress.daysLeft !== 1 ? 's' : ''} left
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className="tnum text-sm font-semibold text-ink">{fmtFee(c.fee)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <Badge className={STATUS_CLS[c.status] ?? 'bg-surface-overlay text-ink-3 border-rim'}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={`/training-contracts/${c.id}`}
                    title="View contract"
                    className="inline-flex items-center gap-1 whitespace-nowrap border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                  >
                    <FileText size={12} /> View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
