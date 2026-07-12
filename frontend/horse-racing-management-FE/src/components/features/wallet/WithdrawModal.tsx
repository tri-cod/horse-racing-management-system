import { useState, useEffect } from 'react';
import { ArrowDownLeft, Landmark, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import {
  getMyBankAccounts,
  addBankAccount,
  createWithdraw,
} from '@/api/walletApi';
import Modal from '@/components/ui/Modal';
import { getErrorMessage } from '@/utils/errors';
import type { BankAccount } from '@/types';

const fmt = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const inputCls =
  'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none ' +
  'placeholder:text-ink-4 focus:border-navy focus:ring-1 focus:ring-navy/10 transition-colors';

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function WithdrawModal({ open, onClose, onSuccess }: WithdrawModalProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Add bank account form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingBank, setAddingBank] = useState(false);
  const [bankForm, setBankForm] = useState({ bankName: '', bankNumber: '', bankUserName: '' });
  const [bankError, setBankError] = useState('');

  useEffect(() => {
    if (!open) return;
    setAmount('');
    setError('');
    setSuccess(false);
    setShowAddForm(false);
    setBankForm({ bankName: '', bankNumber: '', bankUserName: '' });
    setBankError('');
    setLoadingAccounts(true);
    getMyBankAccounts()
      .then((data) => {
        setAccounts(data ?? []);
        if (data && data.length > 0) setSelectedAccountId(data[0].id);
        else { setSelectedAccountId(null); setShowAddForm(true); }
      })
      .catch(() => setError('Unable to load bank accounts.'))
      .finally(() => setLoadingAccounts(false));
  }, [open]);

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.bankNumber || !bankForm.bankUserName) {
      setBankError('Please fill in all fields.'); return;
    }
    setAddingBank(true); setBankError('');
    try {
      const created = await addBankAccount(bankForm);
      if (created) {
        setAccounts((prev) => [...prev, created]);
        setSelectedAccountId(created.id);
      }
      setShowAddForm(false);
      setBankForm({ bankName: '', bankNumber: '', bankUserName: '' });
    } catch (e: unknown) {
      setBankError(getErrorMessage(e, 'Failed to add bank account.'));
    } finally { setAddingBank(false); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 10_000) { setError('Minimum withdrawal is 10,000 ₫.'); return; }
    if (!selectedAccountId) { setError('Please select a bank account.'); return; }
    setSubmitting(true); setError('');
    try {
      await createWithdraw({ amount: amt, bankAccountId: selectedAccountId });
      setSuccess(true);
      onSuccess?.();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to submit withdrawal request.'));
    } finally { setSubmitting(false); }
  };

  const header = (
    <div>
      <div className="flex items-center gap-2">
        <ArrowDownLeft size={14} className="text-gold" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Wallet</p>
      </div>
      <h2 className="mt-0.5 font-serif text-xl font-bold text-ink">Withdraw Funds</h2>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={header} backdrop="navy" accentClassName="bg-gold" bodyClassName="px-6 py-5">
      {success ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center bg-ok-subtle text-ok">
                <CheckCircle size={28} />
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-ink">Request Submitted</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-3">
                  Your withdrawal request is pending admin approval. Funds will be transferred to your bank account after verification.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 bg-navy px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep"
              >
                Done
              </button>
            </div>
          ) : loadingAccounts ? (
            <div className="space-y-3 py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse border border-rim bg-surface-overlay" />
              ))}
            </div>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-5" noValidate>

              {/* Bank account selector */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-3">
                    Receive to
                  </label>
                  {accounts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm((v) => !v)}
                      className="flex items-center gap-1 text-xs font-semibold text-navy transition-colors hover:text-navy-hi"
                    >
                      <Plus size={11} />
                      {showAddForm ? 'Cancel' : 'Add account'}
                    </button>
                  )}
                </div>

                {/* Existing accounts */}
                {accounts.length > 0 && (
                  <div className="space-y-2">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`w-full border px-4 py-3 text-left transition-colors ${
                          selectedAccountId === acc.id
                            ? 'border-navy bg-navy/5'
                            : 'border-rim hover:border-navy/40 hover:bg-surface-overlay/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Landmark size={16} className={selectedAccountId === acc.id ? 'text-navy' : 'text-ink-4'} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-ink">{acc.bankName}</p>
                            <p className="tnum text-xs text-ink-3">
                              {acc.bankNumber} · {acc.bankUserName}
                            </p>
                          </div>
                          {selectedAccountId === acc.id && (
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-navy" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {accounts.length === 0 && !showAddForm && (
                  <div className="border border-rim bg-surface-overlay px-4 py-5 text-center">
                    <Landmark size={20} className="mx-auto text-ink-4" />
                    <p className="mt-2 text-sm text-ink-3">No bank accounts added yet.</p>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="mt-2 text-xs font-semibold text-navy hover:text-navy-hi"
                    >
                      Add a bank account
                    </button>
                  </div>
                )}

                {/* Add bank account inline form */}
                {showAddForm && (
                  <div className="mt-3 border border-rim bg-surface-overlay p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">New Bank Account</p>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        placeholder="Bank name (e.g. Vietcombank)"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm((p) => ({ ...p, bankName: e.target.value }))}
                        className={inputCls}
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
                      <button
                        type="button"
                        onClick={handleAddBank}
                        disabled={addingBank}
                        className="w-full border border-navy py-2 text-xs font-bold uppercase tracking-widest text-navy transition-colors hover:bg-navy hover:text-on-blue disabled:opacity-50"
                      >
                        {addingBank ? 'Saving…' : 'Save Account'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="withdraw-amount" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-3">
                  Amount (VND)
                </label>
                <div className="relative">
                  <input
                    id="withdraw-amount"
                    type="number"
                    min={10000}
                    step={1000}
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full appearance-none border border-rim bg-surface-input px-4 py-3 pr-10 text-lg font-semibold text-ink outline-none transition [appearance:textfield] placeholder:text-ink-4 focus:border-navy focus:ring-1 focus:ring-navy/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-ink-4">₫</span>
                </div>
                {amount && parseInt(amount) >= 10_000 && (
                  <p className="mt-1 text-xs text-ink-3">{fmt(parseInt(amount))}</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 border border-fail/20 bg-fail-subtle px-3 py-2.5 text-xs text-fail">
                  <AlertCircle size={13} className="shrink-0" /> {error}
                </div>
              )}

              <p className="text-xs leading-relaxed text-ink-4">
                Withdrawal requests are reviewed by our admin team. Please allow 1–2 business days for processing.
              </p>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 border border-rim py-2.5 text-xs font-bold uppercase tracking-widest text-ink-2 transition-colors hover:bg-surface-overlay"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedAccountId || !amount || parseInt(amount) < 10_000}
                  className="flex-1 bg-navy py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Request Withdrawal'}
                </button>
              </div>
            </form>
          )}
    </Modal>
  );
}
