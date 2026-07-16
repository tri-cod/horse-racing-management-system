import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Flag } from 'lucide-react';
import { getWithdrawPending, approveWithdrawal, rejectWithdrawal } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { RaceHorse } from '@/types';

function RequestsSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-surface-overlay" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminWithdrawalRequestsPage() {
  const addToast = useToast();
  const [requests, setRequests] = useState<RaceHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getWithdrawPending();
      setRequests(list ?? []);
      setError('');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load withdrawal requests.'));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (r: RaceHorse) => {
    setActionId(r.id);
    try {
      await approveWithdrawal(r.id);
      addToast(`Withdrawal approved for "${r.horseName ?? 'horse'}".`, 'success');
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to approve withdrawal.'), 'error');
    } finally { setActionId(null); }
  };

  const handleReject = async (r: RaceHorse) => {
    setActionId(r.id);
    try {
      await rejectWithdrawal(r.id);
      addToast(`Withdrawal rejected for "${r.horseName ?? 'horse'}". Entry restored.`, 'success');
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e: unknown) {
      addToast(getErrorMessage(e, 'Failed to reject withdrawal.'), 'error');
    } finally { setActionId(null); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Horse Withdrawal Requests" description="Review horse owner requests to withdraw a horse from a race." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Horse Withdrawal Requests"
        subtitle={requests.length > 0 ? `${requests.length} awaiting review` : 'No pending horse withdrawals'}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={fetchRequests} className="font-semibold underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <RequestsSkeleton />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No pending horse withdrawals"
          subtitle="Requests from horse owners to pull a horse out of a race will appear here."
        />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['Horse', 'Race', 'Jockey', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {requests.map((r) => {
                  const isLoading = actionId === r.id;
                  const initial = r.horseName?.charAt(0)?.toUpperCase() ?? '?';
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-surface-overlay/40">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {r.horseAvatarUrl ? (
                            <img src={r.horseAvatarUrl} alt={r.horseName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                              {initial}
                            </div>
                          )}
                          <span className="font-serif text-sm font-bold text-ink">{r.horseName ?? `Horse #${r.horseId}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-2">{r.raceName ?? `Race #${r.raceId}`}</td>
                      <td className="px-5 py-3.5 text-sm text-ink-2">{r.jockeyName ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleApprove(r)}
                            className="inline-flex items-center gap-1 border border-ok/30 bg-ok-subtle px-2.5 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok hover:text-white disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleReject(r)}
                            className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-2.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail hover:text-white disabled:opacity-50"
                          >
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
