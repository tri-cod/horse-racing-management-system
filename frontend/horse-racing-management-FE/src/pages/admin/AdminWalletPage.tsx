import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Landmark, RefreshCw, TrendingUp, ArrowUpCircle, ArrowDownCircle,
  CheckCircle2, XCircle, ArrowDownLeft, BadgeDollarSign, Copy, Wallet,
} from 'lucide-react';
import {
  getSystemBalance, getPendingWithdraws, approveWithdraw, rejectWithdraw,
  getPendingDeposits, approveDeposit, rejectDeposit,
} from '@/api/walletApi';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import EmptyState from '@/components/ui/EmptyState';
import Seo from '@/components/seo/Seo';
import type { PendingTransaction } from '@/types';

type Tab = 'deposits' | 'wallet';

const fmt = (n: number | null | undefined) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

/* ── Toggle switch — gạt trái = Deposit Requests, gạt phải = System Wallet ── */
function TabSwitch({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="relative inline-flex items-center border border-rim bg-surface-overlay p-1">
      <div
        className={`absolute inset-y-1 w-[calc(50%-4px)] bg-navy transition-transform duration-200 ease-out ${
          tab === 'wallet' ? 'translate-x-[calc(100%+8px)]' : 'translate-x-0'
        }`}
      />
      <button
        type="button"
        onClick={() => onChange('deposits')}
        className={`relative z-10 flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
          tab === 'deposits' ? 'text-on-blue' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <BadgeDollarSign size={13} /> Deposit Requests
      </button>
      <button
        type="button"
        onClick={() => onChange('wallet')}
        className={`relative z-10 flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
          tab === 'wallet' ? 'text-on-blue' : 'text-ink-3 hover:text-ink'
        }`}
      >
        <Landmark size={13} /> System Wallet
      </button>
    </div>
  );
}

/* ══════════════════════════ Deposit Requests panel ══════════════════════════ */

function DepositsTableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="border-b border-rim bg-surface-overlay px-5 py-3">
        <div className="flex gap-10">
          {[120, 100, 120, 120, 140, 100].map((w, i) => (
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

function DepositsPanel() {
  const [deposits, setDeposits] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchDeposits = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getPendingDeposits();
      // Filter client-side: backend /deposit/pending returns ALL pending (both types)
      setDeposits((data ?? []).filter((d) => d.requestType === 'DEPOSIT'));
    }
    catch { setError('Failed to load deposits.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 2000);
  };

  const handle = async (id: number, action: 'approve' | 'reject') => {
    const note = notes[id]?.trim() || (action === 'approve' ? 'Approved by admin' : 'Rejected by admin');
    setActionId(id);
    try {
      if (action === 'approve') await approveDeposit(id, note);
      else await rejectDeposit(id, note);
      setDeposits((prev) => prev.filter((d) => d.id !== id));
      setNotes((prev) => { const next = { ...prev }; delete next[id]; return next; });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err?.response?.data?.message ?? `Failed to ${action}.`);
    } finally { setActionId(null); }
  };

  if (loading) return <DepositsTableSkeleton />;

  if (deposits.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="No pending deposits"
        subtitle="All deposit requests have been processed."
      />
    );
  }

  return (
    <>
      {error && <div className="mb-4 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</div>}
      <div className="overflow-hidden border border-rim bg-surface-raised">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-rim bg-surface-overlay">
                {['User', 'Amount', 'Ref. Code', 'Submitted', 'Note', 'Actions'].map((h) => (
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
                  <td className="px-5 py-3.5">
                    {d.referenceCode ? (
                      <div className="flex items-center gap-1.5">
                        <code className="text-xs font-semibold text-ink">{d.referenceCode}</code>
                        <button
                          type="button"
                          title="Copy reference code"
                          onClick={() => handleCopy(d.id, d.referenceCode!)}
                          className="flex shrink-0 items-center gap-1 border border-rim px-1.5 py-1 text-[10px] font-medium text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
                        >
                          {copiedId === d.id ? <CheckCircle2 size={11} className="text-ok" /> : <Copy size={11} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-ink-4">—</span>
                    )}
                  </td>
                  <td className="tnum px-5 py-3.5 text-sm text-ink-3">{fmtDate(d.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="text"
                      placeholder="Add a note (optional)"
                      value={notes[d.id] ?? ''}
                      onChange={(e) => setNotes((prev) => ({ ...prev, [d.id]: e.target.value }))}
                      className="w-48 border border-rim bg-surface-input px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-4 outline-none transition-colors focus:border-gold"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={actionId === d.id}
                        onClick={() => handle(d.id, 'approve')}
                        className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-3 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok/20 disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} /> Approve
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
    </>
  );
}

/* ══════════════════════════ System Wallet panel ══════════════════════════ */

function WithdrawTableSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      <div className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-4 border-b border-rim bg-surface-overlay px-5 py-3">
        {['User', 'Amount', 'Bank Account', 'Actions'].map((h) => (
          <div key={h} className="h-3 w-20 animate-pulse bg-surface-overlay" />
        ))}
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1.5fr_auto] gap-4 px-5 py-4">
          <div className="h-4 w-28 animate-pulse bg-surface-overlay" />
          <div className="h-4 w-24 animate-pulse bg-surface-overlay" />
          <div className="h-4 w-36 animate-pulse bg-surface-overlay" />
          <div className="flex gap-2">
            <div className="h-8 w-20 animate-pulse bg-surface-overlay" />
            <div className="h-8 w-20 animate-pulse bg-surface-overlay" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface ActionState { id: number; action: 'approve' | 'reject'; note: string; username?: string; amount?: number }

function WalletPanel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');

  const [withdraws, setWithdraws] = useState<PendingTransaction[]>([]);
  const [withdrawLoading, setWithdrawLoading] = useState(true);
  const [withdrawError, setWithdrawError] = useState('');

  const [actionState, setActionState] = useState<ActionState | null>(null);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchBalance = useCallback(async () => {
    setBalanceLoading(true); setBalanceError('');
    try {
      const data = await getSystemBalance();
      setBalance((data as unknown as { balance?: number }).balance ?? data as unknown as number);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setBalanceError(err?.response?.data?.message ?? 'Failed to load system wallet.');
    } finally { setBalanceLoading(false); }
  }, []);

  const fetchWithdraws = useCallback(async () => {
    setWithdrawLoading(true); setWithdrawError('');
    try {
      const data = await getPendingWithdraws();
      setWithdraws(data ?? []);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setWithdrawError(err?.response?.data?.message ?? 'Failed to load withdrawal requests.');
    } finally { setWithdrawLoading(false); }
  }, []);

  const refresh = useCallback(() => { fetchBalance(); fetchWithdraws(); }, [fetchBalance, fetchWithdraws]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAction = async () => {
    if (!actionState) return;
    setProcessing(true); setActionError('');
    try {
      if (actionState.action === 'approve') {
        await approveWithdraw(actionState.id, actionState.note || 'Approved');
      } else {
        await rejectWithdraw(actionState.id, actionState.note || 'Rejected');
      }
      setActionState(null);
      fetchWithdraws();
      fetchBalance();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setActionError(err?.response?.data?.message ?? 'Action failed.');
    } finally { setProcessing(false); }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={refresh}
          disabled={balanceLoading || withdrawLoading}
          className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-ink disabled:opacity-50"
        >
          <RefreshCw size={13} className={(balanceLoading || withdrawLoading) ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden border border-rim bg-surface-raised">
          <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform group-hover:scale-x-100" />
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-navy text-gold">
              <Landmark size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">System Balance</p>
              {balanceLoading ? (
                <div className="mt-2 h-7 w-40 animate-pulse bg-surface-overlay" />
              ) : balanceError ? (
                <p className="mt-1 text-sm text-fail">{balanceError}</p>
              ) : (
                <p className="tnum mt-1 text-2xl font-bold text-ink">{fmt(balance)}</p>
              )}
            </div>
          </div>
          <div className="border-t border-rim bg-surface-overlay/50 px-5 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-ink-3">
              <TrendingUp size={11} /> Total funds held by Royal Derby
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden border border-rim bg-surface-raised opacity-60">
          <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform group-hover:scale-x-100" />
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-ok-subtle text-ok">
              <ArrowUpCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Total Deposits</p>
              <p className="tnum mt-1 text-2xl font-bold text-ink">—</p>
            </div>
          </div>
          <div className="border-t border-rim bg-surface-overlay/50 px-5 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-ink-3">
              <ArrowUpCircle size={11} /> Cumulative approved deposits
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden border border-rim bg-surface-raised opacity-60">
          <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform group-hover:scale-x-100" />
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-fail-subtle text-fail">
              <ArrowDownCircle size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Total Payouts</p>
              <p className="tnum mt-1 text-2xl font-bold text-ink">—</p>
            </div>
          </div>
          <div className="border-t border-rim bg-surface-overlay/50 px-5 py-2.5">
            <p className="flex items-center gap-1.5 text-xs text-ink-3">
              <ArrowDownCircle size={11} /> Cumulative winnings paid out
            </p>
          </div>
        </div>
      </div>

      {/* Pending Withdrawals */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Withdrawals</p>
            <h2 className="font-serif text-lg font-bold text-ink">Pending Requests</h2>
          </div>
          {!withdrawLoading && withdraws.length > 0 && (
            <span className="inline-flex items-center gap-1.5 border border-warn/30 bg-warn-subtle px-3 py-1 text-xs font-bold text-warn">
              <ArrowDownLeft size={12} /> {withdraws.length} pending
            </span>
          )}
        </div>

        {withdrawError && (
          <div className="mb-4 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">{withdrawError}</div>
        )}

        {withdrawLoading ? (
          <WithdrawTableSkeleton />
        ) : withdraws.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-rim bg-surface-raised py-12 text-center">
            <ArrowDownLeft size={24} className="text-ink-4" />
            <p className="text-sm font-semibold text-ink-2">No pending withdrawals</p>
            <p className="text-xs text-ink-4">All withdrawal requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-rim bg-surface-overlay">
                  {['User', 'Amount', 'Bank Info', 'Submitted', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rim">
                {withdraws.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-surface-overlay/40">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-ink">{w.user?.username ?? '—'}</p>
                      {w.user?.fullName && <p className="text-xs text-ink-3">{w.user.fullName}</p>}
                    </td>
                    <td className="tnum px-5 py-4 text-sm font-bold text-ink">{fmt(w.amount)}</td>
                    <td className="px-5 py-4 text-xs text-ink-3 max-w-[200px]">
                      <span className="break-words">{w.verifyNote ?? '—'}</span>
                    </td>
                    <td className="tnum px-5 py-4 text-xs text-ink-3">{fmtDate(w.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setActionState({ id: w.id, action: 'approve', note: '', username: w.user?.username, amount: w.amount }); setActionError(''); }}
                          className="inline-flex items-center gap-1 border border-ok/30 bg-ok-subtle px-3 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok hover:text-white"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActionState({ id: w.id, action: 'reject', note: '', username: w.user?.username, amount: w.amount }); setActionError(''); }}
                          className="inline-flex items-center gap-1 border border-fail/30 bg-fail-subtle px-3 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail hover:text-white"
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
        )}
      </div>

      {/* Confirm action modal */}
      {actionState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && !processing && setActionState(null)}
        >
          <div className="relative w-full max-w-sm border border-rim bg-surface-raised shadow-modal">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
            <div className="px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                {actionState.action === 'approve' ? 'Approve' : 'Reject'} Withdrawal
              </p>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-ink">
                Confirm {actionState.action === 'approve' ? 'Approval' : 'Rejection'}
              </h3>
              <p className="mt-2 text-sm text-ink-3">
                Request <span className="font-semibold text-ink">#{actionState.id}</span>
                {actionState.username && <> · <span className="font-semibold text-ink">{actionState.username}</span></>}
                {actionState.amount && <> · <span className="font-semibold text-ink">{fmt(actionState.amount)}</span></>}
              </p>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                Note {actionState.action === 'reject' ? '(required)' : '(optional)'}
              </label>
              <input
                type="text"
                autoFocus
                placeholder={actionState.action === 'approve' ? 'Approved by admin' : 'Reason for rejection…'}
                value={actionState.note}
                onChange={(e) => setActionState((p) => p ? { ...p, note: e.target.value } : p)}
                className="mt-1.5 w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-navy focus:ring-1 focus:ring-navy/10"
              />

              {actionError && (
                <div className="mt-3 border border-fail/20 bg-fail-subtle px-3 py-2 text-xs text-fail">{actionError}</div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionState(null)}
                  disabled={processing}
                  className="flex-1 border border-rim py-2.5 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAction}
                  disabled={processing || (actionState.action === 'reject' && !actionState.note.trim())}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    actionState.action === 'approve'
                      ? 'bg-ok hover:bg-ok/80'
                      : 'bg-fail hover:bg-fail/80'
                  }`}
                >
                  {processing ? 'Processing…' : actionState.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ══════════════════════════ Page shell — toggle wired to ?tab= ══════════════════════════ */

export default function AdminWalletPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'deposits' ? 'deposits' : 'wallet';

  const setTab = (t: Tab) => {
    setSearchParams(t === 'wallet' ? {} : { tab: t }, { replace: true });
  };

  return (
    <div className="px-8 py-6">
      <Seo title="System Wallet" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="System Wallet"
        subtitle={tab === 'deposits' ? 'Verify VietQR deposit transfers' : 'Platform balance and pending withdrawal requests'}
        action={<TabSwitch tab={tab} onChange={setTab} />}
      />

      {tab === 'deposits' ? <DepositsPanel /> : <WalletPanel />}
    </div>
  );
}
