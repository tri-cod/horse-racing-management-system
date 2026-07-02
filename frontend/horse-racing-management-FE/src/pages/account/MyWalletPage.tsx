import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Plus, TrendingUp, ArrowRight, RefreshCw,
  ArrowDownLeft, Landmark, X, AlertCircle, Check,
} from 'lucide-react';
import { getBalance, getMyBankAccounts, addBankAccount } from '@/api/walletApi';
import type { BankAccount } from '@/types';
import DepositModal from '@/components/features/wallet/DepositModal';
import WithdrawModal from '@/components/features/wallet/WithdrawModal';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

const fmt = (n: number | null) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const inputCls =
  'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none ' +
  'placeholder:text-ink-4 focus:border-gold focus:ring-1 focus:ring-gold/20 transition-colors';

const EMPTY_FORM = { bankName: '', bankNumber: '', bankUserName: '' };

export default function MyWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Bank accounts
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bankForm, setBankForm] = useState(EMPTY_FORM);
  const [addingBank, setAddingBank] = useState(false);
  const [bankError, setBankError] = useState('');
  const [bankSuccess, setBankSuccess] = useState(false);

  const fetchBalance = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getBalance();
      setBalance((data as unknown as { balance: number }).balance ?? data as unknown as number);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? 'Unable to load wallet.');
    } finally { setLoading(false); }
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoadingAccounts(true);
    try {
      const data = await getMyBankAccounts();
      setAccounts(data ?? []);
    } catch {
      // silent — not critical
    } finally { setLoadingAccounts(false); }
  }, []);

  useEffect(() => { fetchBalance(); fetchAccounts(); }, [fetchBalance, fetchAccounts]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.bankNumber || !bankForm.bankUserName) {
      setBankError('Please fill in all fields.'); return;
    }
    setAddingBank(true); setBankError('');
    try {
      const created = await addBankAccount(bankForm);
      if (created) setAccounts((prev) => [...prev, created]);
      setBankForm(EMPTY_FORM);
      setShowAddForm(false);
      setBankSuccess(true);
      setTimeout(() => setBankSuccess(false), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setBankError(err?.response?.data?.message ?? 'Failed to add bank account.');
    } finally { setAddingBank(false); }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setBankForm(EMPTY_FORM);
    setBankError('');
  };

  return (
    <div className="px-8 py-6">
      <Seo title="My Wallet" description="Manage your Royal Derby wallet balance." />
      <DashboardPageHeader
        eyebrow="Account"
        title="My Wallet"
        subtitle="Your Royal Derby balance and deposit history"
        action={
          <button
            type="button"
            onClick={() => { fetchBalance(); fetchAccounts(); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-ink disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      <div className="mx-auto max-w-2xl space-y-4">

        {/* Balance card */}
        <div className="relative overflow-hidden border border-rim bg-surface-raised">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
          <div className="flex items-center gap-5 px-6 py-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-navy text-gold">
              <Wallet size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Available Balance</p>
              {loading ? (
                <div className="mt-2 h-9 w-52 animate-pulse bg-surface-overlay" />
              ) : error ? (
                <p className="mt-1 text-sm text-fail">{error}</p>
              ) : (
                <p className="tnum mt-1 font-serif text-3xl font-bold text-ink">{fmt(balance)}</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setShowWithdraw(true)}
                className="inline-flex items-center gap-1.5 border border-rim-hi px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-ink"
              >
                <ArrowDownLeft size={14} /> Withdraw
              </button>
              <button
                type="button"
                onClick={() => setShowDeposit(true)}
                className="inline-flex items-center gap-1.5 bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi"
              >
                <Plus size={14} /> Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Bank accounts */}
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="flex items-center justify-between border-b border-rim px-5 py-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Bank Accounts</p>
              <p className="mt-0.5 font-serif text-sm font-semibold text-ink">Saved accounts for withdrawal</p>
            </div>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => { setShowAddForm(true); setBankError(''); }}
                className="inline-flex items-center gap-1.5 border border-navy/30 bg-navy/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-navy/10"
              >
                <Plus size={12} /> Add Account
              </button>
            )}
          </div>

          {/* Success banner */}
          {bankSuccess && (
            <div className="flex items-center gap-2 border-b border-ok/20 bg-ok-subtle px-5 py-2.5 text-xs font-semibold text-ok">
              <Check size={13} /> Bank account added successfully.
            </div>
          )}

          {/* Account list */}
          {loadingAccounts ? (
            <div className="divide-y divide-rim">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-9 w-9 animate-pulse bg-surface-overlay" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 animate-pulse bg-surface-overlay" />
                    <div className="h-2.5 w-40 animate-pulse bg-surface-overlay" />
                  </div>
                </div>
              ))}
            </div>
          ) : accounts.length === 0 && !showAddForm ? (
            <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
              <Landmark size={20} className="text-ink-4" />
              <p className="text-sm font-semibold text-ink-2">No bank accounts yet</p>
              <p className="text-xs text-ink-4">Add a bank account to enable withdrawals.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-navy-hi"
              >
                <Plus size={12} /> Add your first account
              </button>
            </div>
          ) : (
            <div className="divide-y divide-rim">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-overlay text-ink-3">
                    <Landmark size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{acc.bankName}</p>
                    <p className="tnum mt-0.5 text-xs text-ink-3">
                      {acc.bankNumber} · {acc.bankUserName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add bank account inline form */}
          {showAddForm && (
            <div className="border-t border-rim bg-surface-overlay/40 px-5 py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-ink-3">New Bank Account</p>
              <form onSubmit={handleAddBank} className="space-y-2.5" noValidate>
                <input
                  type="text"
                  placeholder="Bank name (e.g. Vietcombank, MB Bank)"
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                  className={inputCls}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Account number"
                  value={bankForm.bankNumber}
                  onChange={(e) => setBankForm((p) => ({ ...p, bankNumber: e.target.value }))}
                  className={`${inputCls} tnum`}
                />
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={bankForm.bankUserName}
                  onChange={(e) => setBankForm((p) => ({ ...p, bankUserName: e.target.value }))}
                  className={inputCls}
                />
                {bankError && (
                  <div className="flex items-center gap-2 border border-fail/20 bg-fail-subtle px-3 py-2 text-xs text-fail">
                    <AlertCircle size={13} className="shrink-0" /> {bankError}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={cancelAdd}
                    disabled={addingBank}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 border border-rim py-2 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
                  >
                    <X size={12} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingBank}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 bg-navy py-2 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Check size={12} /> {addingBank ? 'Saving...' : 'Save Account'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="border-b border-rim px-5 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">How It Works</p>
            <p className="mt-0.5 font-serif text-sm font-semibold text-ink">Deposits & Withdrawals</p>
          </div>
          <div className="divide-y divide-rim">
            <div className="flex items-start gap-4 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-navy/10 text-navy">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Deposit via VietQR</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-3">
                  Submit a deposit request and transfer the exact amount via VietQR. Your balance will be updated
                  after admin verification — usually within a few hours.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeposit(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-navy transition-colors hover:text-navy-hi"
                >
                  Request a deposit <ArrowRight size={12} />
                </button>
              </div>
            </div>
            <div className="flex items-start gap-4 px-5 py-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-overlay text-ink-3">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Withdraw to Bank Account</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-3">
                  Add your bank account and submit a withdrawal request. Admin will process it within 1–2 business days.
                </p>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-navy transition-colors hover:text-navy-hi"
                >
                  Request a withdrawal <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} onSuccess={fetchBalance} />
      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} onSuccess={fetchBalance} />
    </div>
  );
}
