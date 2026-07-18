import { Trash2, Gavel } from 'lucide-react';
import { cancelPenalty } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import EmptyState from '@/components/ui/EmptyState';
import PenaltyBadge from './PenaltyBadge';
import type { Penalty } from '@/types';

const fmtMoney = (n?: number | null) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : null;

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : '—';

export default function PenaltyList({
  penalties,
  loading,
  error,
  showRefereeName = false,
  onChanged,
  onToast,
}: {
  penalties: Penalty[];
  loading?: boolean;
  error?: string;
  showRefereeName?: boolean;
  onChanged?: () => void;
  onToast?: (msg: string, type?: 'success' | 'error') => void;
}) {
  // Backend hard-deletes the row (penaltyRepository.deleteById) — there is no
  // soft-delete or audit trail, so confirm before firing.
  const handleCancel = async (p: Penalty) => {
    const extra = p.isDisqualified
      ? '\n\nThe horse will be reinstated into the race.'
      : '';
    const ok = window.confirm(
      `Cancel this penalty for ${p.horseName ?? 'this horse'}? This cannot be undone.${extra}`,
    );
    if (!ok) return;

    try {
      await cancelPenalty(p.id);
      onToast?.('Penalty cancelled.', 'success');
      onChanged?.();
    } catch (e: unknown) {
      onToast?.(getErrorMessage(e, 'Failed to cancel penalty.'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse bg-surface-overlay" />
        ))}
      </div>
    );
  }

  if (error) return <p className="py-4 text-sm text-fail">{error}</p>;

  if (penalties.length === 0) {
    return <EmptyState icon={Gavel} title="No penalties" subtitle="Nothing has been issued yet." />;
  }

  return (
    <div className="flex flex-col gap-2">
      {penalties.map((p) => (
        <div
          key={p.id}
          className="flex flex-wrap items-center gap-3 border border-rim bg-surface-raised px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">
                {p.horseName ?? `Race horse #${p.raceHorseId}`}
              </span>
              <PenaltyBadge type={p.penaltyType} />
            </div>

            {p.reason && <p className="mt-0.5 text-xs text-ink-3">{p.reason}</p>}

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-ink-4">
              <span>{fmtDate(p.createdAt)}</span>
              {p.amount != null && <span className="tnum text-gold-hi">{fmtMoney(p.amount)}</span>}
              {p.timePenaltySeconds != null && (
                <span className="tnum">+{p.timePenaltySeconds}s</span>
              )}
              {showRefereeName && p.refereeName && <span>by {p.refereeName}</span>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleCancel(p)}
            className="inline-flex shrink-0 items-center gap-1.5 border border-rim px-2.5 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-fail/40 hover:text-fail"
          >
            <Trash2 size={12} /> Cancel
          </button>
        </div>
      ))}
    </div>
  );
}