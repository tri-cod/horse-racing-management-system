import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Building2, Plus, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { getMyBankAccounts, addBankAccount, createWithdraw } from '../../api/walletApi';
import '../../assets/css/wallet/WithdrawModal.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const BASE_AMOUNTS = [200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

const getQuickAmounts = (balance) => {
  // Lấy các mức cố định <= balance
  const fixed = BASE_AMOUNTS.filter((a) => a < balance);
  // Thêm các mức % nếu balance lớn (25%, 50%, 75%)
  if (balance >= 20_000_000) {
    const pcts = [0.25, 0.5, 0.75]
      .map((p) => Math.floor(balance * p / 1000) * 1000)
      .filter((a) => !fixed.includes(a) && a > 0 && a < balance);
    const merged = [...new Set([...fixed, ...pcts])].sort((a, b) => a - b);
    return merged.slice(-6); // tối đa 6 mức
  }
  return fixed;
};

// Logo thật từ VietQR
const BANKS = [
  { code: 'VCB',   shortName: 'Vietcombank'  },
  { code: 'ICB',   shortName: 'VietinBank'   },
  { code: 'BIDV',  shortName: 'BIDV'         },
  { code: 'AGR',   shortName: 'Agribank'     },
  { code: 'MB',    shortName: 'MB Bank'      },
  { code: 'TCB',   shortName: 'Techcombank'  },
  { code: 'ACB',   shortName: 'ACB'          },
  { code: 'VPB',   shortName: 'VPBank'       },
  { code: 'TPB',   shortName: 'TPBank'       },
  { code: 'STB',   shortName: 'Sacombank'    },
  { code: 'HDB',   shortName: 'HDBank'       },
  { code: 'OCB',   shortName: 'OCB'          },
  { code: 'MSB',   shortName: 'MSB'          },
  { code: 'SHB',   shortName: 'SHB'          },
  { code: 'EIB',   shortName: 'Eximbank'     },
  { code: 'NAB',   shortName: 'Nam A Bank'   },
  { code: 'LPB',   shortName: 'LPBank'       },
  { code: 'SEAB',  shortName: 'SeABank'      },
  { code: 'KLB',   shortName: 'Kienlongbank' },
  { code: 'CAKE',  shortName: 'CAKE'         },
  { code: 'UBANK', shortName: 'Ubank'        },
];

const getBankLogo = (code) => `https://api.vietqr.io/img/${code}.png`;

const fmtShort = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}tỉ`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}tr`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
};

// ── Bank Combobox — vừa gõ vừa chọn, Enter/ArrowKey để chọn
function BankCombobox({ value, onChange }) {
  const [query, setQuery]             = useState(value || '');
  const [open, setOpen]               = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [imgErrors, setImgErrors]     = useState({});
  const inputRef                      = useRef(null);
  const ref                           = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANKS;
    const startsWith = BANKS.filter((b) =>
      b.shortName.toLowerCase().startsWith(q) ||
      b.code.toLowerCase().startsWith(q)
    );
    const contains = BANKS.filter((b) =>
      !b.shortName.toLowerCase().startsWith(q) &&
      !b.code.toLowerCase().startsWith(q) &&
      (b.shortName.toLowerCase().includes(q) || b.code.toLowerCase().includes(q))
    );
    return [...startsWith, ...contains];
  })();

  const selectedBank = BANKS.find(
    (b) => b.shortName.toLowerCase() === query.toLowerCase()
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setHighlighted(0);
    setOpen(true);
  };

  const handleSelect = (bank) => {
    setQuery(bank.shortName);
    onChange(bank.shortName);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) handleSelect(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleImgError = (code) =>
    setImgErrors((prev) => ({ ...prev, [code]: true }));

  return (
    <div className="bank-combo" ref={ref}>
      <div className={`bank-combo__input-wrap${open ? ' open' : ''}`}>
        {selectedBank && !imgErrors[selectedBank.code] && (
          <img
            src={getBankLogo(selectedBank.code)}
            alt={selectedBank.shortName}
            className="bank-combo__input-logo"
            onError={() => handleImgError(selectedBank.code)}
          />
        )}
        <input
          ref={inputRef}
          className="bank-combo__input"
          style={{ paddingLeft: selectedBank && !imgErrors[selectedBank.code] ? '44px' : '12px' }}
          placeholder="Search or type bank name…"
          value={query}
          onChange={handleInput}
          onFocus={() => { setOpen(true); setHighlighted(0); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className="bank-combo__dropdown">
          {filtered.map((bank, idx) => (
            <div
              key={bank.code}
              className={`bank-combo__option${highlighted === idx ? ' highlighted' : ''}${selectedBank?.code === bank.code ? ' active' : ''}`}
              onMouseEnter={() => setHighlighted(idx)}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(bank); }}
            >
              <div className="bank-combo__option-logo">
                {!imgErrors[bank.code] ? (
                  <img
                    src={getBankLogo(bank.code)}
                    alt={bank.shortName}
                    onError={() => handleImgError(bank.code)}
                  />
                ) : (
                  <span className="bank-combo__option-fallback">{bank.code[0]}</span>
                )}
              </div>
              <div className="bank-combo__option-info">
                <span className="bank-combo__option-name">{bank.shortName}</span>
                <span className="bank-combo__option-code">{bank.code}</span>
              </div>
              {selectedBank?.code === bank.code && (
                <CheckCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Add Bank Account Form ─────────────────────────────────
function AddBankForm({ onSuccess, onCancel }) {
  const [form, setForm]       = useState({ bankName: '', bankUserName: '', bankNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (k) => (e) => {
    const val = k === 'bankUserName' ? e.target.value.toUpperCase() : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSubmit = async () => {
    if (!form.bankName.trim() || !form.bankUserName.trim() || !form.bankNumber.trim()) {
      setError('Please fill in all fields.'); return;
    }
    try {
      setLoading(true); setError('');
      const result = await addBankAccount(form);
      onSuccess(result);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add bank account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-bank-form">
      <p className="withdraw-bank-form__hint">
        Enter your bank details to receive withdrawals.
      </p>

      <div className="withdraw-bank-form__field">
        <label className="withdraw-bank-form__label">Bank</label>
        <BankCombobox
          value={form.bankName}
          onChange={(val) => setForm((f) => ({ ...f, bankName: val }))}
        />
      </div>

      <div className="withdraw-bank-form__field">
        <label className="withdraw-bank-form__label">Account Holder Name</label>
        <input
          className="withdraw-bank-form__input"
          placeholder="FULL NAME (as printed on card)"
          value={form.bankUserName}
          onChange={set('bankUserName')}
          style={{ textTransform: 'uppercase' }}
        />
        <span className="withdraw-bank-form__sub">Must match your bank account name exactly</span>
      </div>

      <div className="withdraw-bank-form__field">
        <label className="withdraw-bank-form__label">Account Number</label>
        <input
          className="withdraw-bank-form__input withdraw-bank-form__input--mono"
          placeholder="e.g. 0123456789"
          value={form.bankNumber}
          onChange={set('bankNumber')}
          inputMode="numeric"
        />
      </div>

      {error && (
        <div className="withdraw-form__error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="withdraw-bank-form__actions">
        <button type="button" className="ui-btn ui-btn--outline ui-btn--sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="ui-btn ui-btn--dark ui-btn--sm"
          disabled={loading || !form.bankName || !form.bankUserName || !form.bankNumber}
          onClick={handleSubmit}
        >
          {loading ? 'Saving…' : 'Save Account'}
        </button>
      </div>
    </div>
  );
}

// helper: lấy logo cho bank đã lưu (match theo tên)
function BankLogo({ bankName, size = 32 }) {
  const [err, setErr] = useState(false);
  const match = BANKS.find(
    (b) => b.shortName.toLowerCase() === bankName?.toLowerCase()
  );
  if (!match || err) {
    return (
      <div className="withdraw-account-item__icon-fallback" style={{ width: size, height: size }}>
        <Building2 size={size * 0.55} />
      </div>
    );
  }
  return (
    <img
      src={getBankLogo(match.code)}
      alt={match.shortName}
      className="withdraw-account-item__logo"
      style={{ width: size, height: size }}
      onError={() => setErr(true)}
    />
  );
}

// ── Main Modal ────────────────────────────────────────────
export default function WithdrawModal({ open, onClose, onSuccess, currentBalance }) {
  const [step, setStep]                       = useState(1);
  const [accounts, setAccounts]               = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAddForm, setShowAddForm]         = useState(false);
  const [amount, setAmount]                   = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [result, setResult]                   = useState(null);

  useEffect(() => {
    if (open) {
      setStep(1); setSelectedAccount(null); setAmount('');
      setError(''); setResult(null); setShowAddForm(false);
      fetchAccounts();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const data = await getMyBankAccounts();
      setAccounts(data || []);
    } catch {
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleAccountAdded = (newAcc) => {
    setAccounts((prev) => [...prev, newAcc]);
    setSelectedAccount(newAcc);
    setShowAddForm(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedAccount) { setError(accounts.length === 0 ? 'Please add a bank account first.' : 'Please select a bank account to continue.'); return; }
      setError(''); setStep(2);
    } else if (step === 2) {
      const amt = parseInt(amount, 10);
      if (isNaN(amt) || amt < 50000) { setError('Minimum withdrawal is 50,000 ₫.'); return; }
      if (amt > currentBalance) { setError('Insufficient balance.'); return; }
      setError(''); setStep(3);
    }
  };

  const handleConfirm = async () => {
    try {
      setLoading(true); setError('');
      const data = await createWithdraw({ amount: parseInt(amount, 10), bankAccountId: selectedAccount.id });
      setResult(data);
      setStep(4);
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create withdrawal request.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const STEPS = ['Select Account', 'Enter Amount', 'Confirm', 'Done'];

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-dialog modal-dialog--md withdraw-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="withdraw-modal__header-left">
            {step > 1 && step < 4 && (
              <button type="button" className="deposit-modal__back"
                onClick={() => { setError(''); setStep(step - 1); }}>←</button>
            )}
            <div>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>Step {step} of 4</span>
              <h3 className="modal-title">Withdraw Funds</h3>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Step bar */}
        <div className="deposit-modal__steps">
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: i < STEPS.length - 1 ? '1' : 'none' }}>
              <div className={`deposit-modal__step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`}>
                <span className="deposit-modal__step-dot">{step > i + 1 ? '✓' : i + 1}</span>
                <span>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="deposit-modal__step-line" />}
            </div>
          ))}
        </div>

        <div className="modal-body">

          {/* Step 1 */}
          {step === 1 && (
            <div className="withdraw-step">
              {loadingAccounts ? (
                <div className="withdraw-step__loading">Loading accounts…</div>
              ) : showAddForm ? (
                <AddBankForm onSuccess={handleAccountAdded} onCancel={() => setShowAddForm(false)} />
              ) : (
                <>
                  <p className="withdraw-step__label">Select the bank account to receive funds</p>
                  <div className="withdraw-account-list">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        className={`withdraw-account-item${selectedAccount?.id === acc.id ? ' selected' : ''}`}
                        onClick={() => { setSelectedAccount(acc); setError(''); }}
                      >
                        <BankLogo bankName={acc.bankName} size={40} />
                        <div className="withdraw-account-item__info">
                          <span className="withdraw-account-item__bank">{acc.bankName}</span>
                          <span className="withdraw-account-item__name">{acc.bankUserName}</span>
                          <span className="withdraw-account-item__number">{acc.bankNumber}</span>
                        </div>
                        {selectedAccount?.id === acc.id && (
                          <CheckCircle size={18} className="withdraw-account-item__check" />
                        )}
                      </button>
                    ))}
                    <button type="button" className="withdraw-account-add" onClick={() => setShowAddForm(true)}>
                      <Plus size={16} /> Add new bank account
                    </button>
                  </div>

                  {error && <div className="withdraw-form__error"><AlertCircle size={14} /> {error}</div>}

                  <div className="withdraw-step__actions">
                    <button type="button" className="ui-btn ui-btn--outline ui-btn--md" onClick={onClose}>Cancel</button>
                    <button type="button" className="ui-btn ui-btn--primary ui-btn--md" onClick={handleNext} disabled={!selectedAccount}>
                      Continue <ArrowRight size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 2 — Enter amount */}
          {step === 2 && (
            <div className="withdraw-step">
              {/* Balance chip */}
              <div className="wd-balance-chip">
                <div className="wd-balance-chip__left">
                  <span className="wd-balance-chip__label">Available balance</span>
                  <span className="wd-balance-chip__value tnum">{fmt(currentBalance)}</span>
                </div>
                <button
                  type="button"
                  className={`wd-balance-chip__all${parseInt(amount, 10) === currentBalance ? ' active' : ''}`}
                  onClick={() => { if (currentBalance > 0) { setAmount(String(currentBalance)); setError(''); } }}
                  disabled={currentBalance <= 0}
                >
                  Withdraw all
                </button>
              </div>

              {/* Amount input */}
              <div className="wd-amount-field">
                <div className="wd-amount-field__inner">
                  <span className="wd-amount-field__currency">₫</span>
                  <input
                    type="number"
                    className="wd-amount-field__input"
                    placeholder="0"
                    min="50000"
                    step="1000"
                    value={amount}
                    autoFocus
                    onChange={(e) => { setAmount(e.target.value); setError(''); }}
                  />
                </div>
                {amount && parseInt(amount) >= 50000 && (
                  <div className="wd-amount-field__preview">{fmt(parseInt(amount))}</div>
                )}
                {currentBalance <= 0 && (
                  <span className="wd-amount-field__error">Insufficient balance. Please deposit funds first.</span>
                )}
                {amount && parseInt(amount) > currentBalance && currentBalance > 0 && (
                  <span className="wd-amount-field__error">Amount exceeds your available balance.</span>
                )}
              </div>

              {/* Quick amounts */}
              <div className="wd-quick">
                {getQuickAmounts(currentBalance).map((amt) => (
                  <button key={amt} type="button"
                    className={`wd-quick__btn${parseInt(amount, 10) === amt ? ' active' : ''}`}
                    onClick={() => { setAmount(String(amt)); setError(''); }}
                  >
                    {fmtShort(amt)}
                  </button>
                ))}
              </div>

              {error && <div className="withdraw-form__error"><AlertCircle size={14} /> {error}</div>}

              <div className="wd-info">
                <AlertTriangle size={13} />
                <span>Funds are deducted immediately. If rejected, the amount will be refunded.</span>
              </div>

              <div className="withdraw-step__actions">
                <button type="button" className="ui-btn ui-btn--outline ui-btn--md"
                  onClick={() => { setError(''); setStep(1); }}>Back</button>
                <button type="button" className="ui-btn ui-btn--primary ui-btn--md"
                  onClick={handleNext}
                  disabled={!amount || parseInt(amount) < 50000 || parseInt(amount) > currentBalance || currentBalance <= 0}>
                  Review <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Confirm */}
          {step === 3 && (
            <div className="withdraw-step">
              <div className="wd-confirm">
                {/* Amount hero */}
                <div className="wd-confirm__hero">
                  <span className="wd-confirm__hero-label">Withdrawal amount</span>
                  <span className="wd-confirm__hero-value tnum">{fmt(parseInt(amount))}</span>
                  <span className="wd-confirm__hero-remain tnum">
                    Remaining balance: {fmt(currentBalance - parseInt(amount))}
                  </span>
                </div>

                {/* Destination */}
                <div className="wd-confirm__row">
                  <span className="wd-confirm__row-label">To</span>
                  <div className="wd-confirm__bank-card">
                    <BankLogo bankName={selectedAccount?.bankName} size={40} />
                    <div className="wd-confirm__bank-info">
                      <span className="wd-confirm__bank-name">{selectedAccount?.bankName}</span>
                      <span className="wd-confirm__bank-holder">{selectedAccount?.bankUserName}</span>
                      <span className="wd-confirm__bank-number tnum">{selectedAccount?.bankNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                <div className="wd-confirm__warning">
                  <AlertTriangle size={14} />
                  <span>Balance is deducted immediately. Admin will transfer within a few hours.</span>
                </div>
              </div>

              {error && <div className="withdraw-form__error" style={{ marginTop: '12px' }}><AlertCircle size={14} /> {error}</div>}

              <div className="withdraw-step__actions" style={{ marginTop: '20px' }}>
                <button type="button" className="ui-btn ui-btn--outline ui-btn--md"
                  onClick={() => { setError(''); setStep(2); }}>Back</button>
                <button type="button" className="ui-btn ui-btn--primary ui-btn--md"
                  onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Processing…' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === 4 && result && (
            <div className="wd-done">
              <div className="wd-done__icon-wrap">
                <CheckCircle size={32} />
              </div>
              <div className="wd-done__amount tnum">{fmt(result.amount)}</div>
              <p className="wd-done__title">Withdrawal request submitted</p>
              <p className="wd-done__desc">
                Admin will transfer to your <strong>{result.bankName}</strong> account within a few hours.
                You'll receive a notification once it's processed.
              </p>

              <button type="button" className="ui-btn ui-btn--dark ui-btn--md wd-done__close" onClick={onClose}>
                Done
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}