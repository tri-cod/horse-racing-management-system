import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Wallet } from 'lucide-react';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '@/api/walletApi';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { PendingTransaction } from '@/types';

const fmt = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

function TableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="border-b border-rim bg-surface-overlay px-5 py-3">
        <div className="flex gap-10">
          {[120, 100, 120, 100].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-full bg-surface-input" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-rim">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-10 px-5 py-3.5">
            <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-overlay" />
            <div className="flex gap-2">
              <div className="h-7 w-20 animate-pulse bg-surface-overlay" />
              <div className="h-7 w-16 animate-pulse bg-surface-overlay" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDepositPage() {
  const addToast = useToast();
  const [deposits, setDeposits] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingDeposits();
      // Filter client-side: backend /deposit/pending returns ALL pending (both types)
      setDeposits((data ?? []).filter((d) => d.requestType === 'DEPOSIT'));
    }
    catch { addToast('Failed to load deposits.', 'error'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const handle = async (id: number, action: 'approve' | 'reject') => {
    setActionId(id);
    try {
      if (action === 'approve') await approveDeposit(id, 'Approved by admin');
      else await rejectDeposit(id, 'Rejected by admin');
      addToast(`Deposit ${action}d successfully.`, 'success');
      setDeposits((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? `Failed to ${action}.`, 'error');
    } finally { setActionId(null); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Deposit Requests" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Deposit Requests"
        subtitle={loading ? 'Loading…' : `${deposits.length} pending`}
      />

      {loading ? (
        <TableSkeleton />
      ) : deposits.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No pending deposits"
          subtitle="All deposit requests have been processed."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['User', 'Amount', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {deposits.map((d) => (
                  <tr key={d.id} className="transition-colors hover:bg-surface-overlay/40">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-ink">
                        {d.user?.username ?? `#${d.user?.id ?? d.id}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="tnum text-sm font-bold text-gold">{fmt(d.amount)}</span>
                    </td>
                    <td className="tnum px-5 py-3.5 text-sm text-ink-3">{fmtDate(d.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionId === d.id}
                          onClick={() => handle(d.id, 'approve')}
                          className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-3 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok/20 disabled:opacity-50"
                        >
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          disabled={actionId === d.id}
                          onClick={() => handle(d.id, 'reject')}
                          className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-3 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail/20 disabled:opacity-50"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
