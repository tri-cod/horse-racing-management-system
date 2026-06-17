import { useState, useEffect } from 'react';
import { X, AlertCircle, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { createDeposit } from '../../api/walletApi';
import '../../assets/css/wallet/DepositModal.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const QUICK_AMOUNTS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

export default function DepositModal({ open, onClose, onSuccess }) {
  const [step, setStep]       = useState(1);
  const [amount, setAmount]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    if (open) { setStep(1); setAmount(''); setError(''); setResult(null); setCopied(false); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt < 10000) { setError('Minimum deposit is 10,000 ₫.'); return; }
    try {
      setLoading(true); setError('');
      const data = await createDeposit({ amount: amt, paymentMethod: 'QR_CODE' });
      setResult(data);
      setStep(2);
      onSuccess?.();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create deposit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal-dialog modal-dialog--md deposit-modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true"
      >
        <div className="modal-header">
          <div className="deposit-modal__header-left">
            {step === 2 && (
              <button type="button" className="deposit-modal__back" onClick={() => setStep(1)}>
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>
                {step === 1 ? 'Step 1 of 2' : 'Step 2 of 2'}
              </span>
              <h3 className="modal-title">
                {step === 1 ? 'Deposit Funds' : 'Complete Payment'}
              </h3>
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="deposit-modal__steps">
          <div className={`deposit-modal__step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <span className="deposit-modal__step-dot">{step > 1 ? '✓' : '1'}</span>
            <span>Enter Amount</span>
          </div>
          <div className="deposit-modal__step-line" />
          <div className={`deposit-modal__step ${step >= 2 ? 'active' : ''}`}>
            <span className="deposit-modal__step-dot">2</span>
            <span>Scan & Pay</span>
          </div>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="deposit-form">
              <div className="deposit-form__field">
                <label className="deposit-form__label">Amount (VND)</label>
                <div className="deposit-form__input-wrap">
                  <input
                    type="number"
                    className="deposit-form__input"
                    placeholder="0"
                    min="10000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    autoFocus
                  />
                  <span className="deposit-form__suffix">₫</span>
                </div>
                {amount && parseInt(amount) >= 10000 && (
                  <span className="deposit-form__preview">{fmt(parseInt(amount))}</span>
                )}
              </div>

              <div className="deposit-form__quick">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={`deposit-form__quick-btn${parseInt(amount, 10) === amt ? ' active' : ''}`}
                    onClick={() => setAmount(String(amt))}
                  >
                    {fmt(amt).replace('₫', '').trim()}
                  </button>
                ))}
              </div>

              {error && (
                <div className="deposit-form__error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              <div className="deposit-form__info">
                <p>After submitting, you will receive a VietQR code. Transfer the exact amount with the reference code to complete your deposit.</p>
              </div>

              <div className="deposit-form__actions">
                <button type="button" className="ui-btn ui-btn--outline ui-btn--md" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-btn ui-btn--primary ui-btn--md"
                  disabled={loading || !amount || parseInt(amount) < 10000}
                >
                  {loading ? 'Processing…' : 'Generate QR Code →'}
                </button>
              </div>
            </form>
          )}

          {step === 2 && result && (
            <div className="deposit-qr">
              <div className="deposit-qr__amount">
                <span className="deposit-qr__amount-label">Amount to transfer</span>
                <span className="deposit-qr__amount-value">{fmt(result.amount)}</span>
              </div>

              {result.qrUrl ? (
                <div className="deposit-qr__img-wrap">
                  <img src={result.qrUrl} alt="VietQR Code" className="deposit-qr__img" />
                  <span className="deposit-qr__brand">Powered by VietQR</span>
                </div>
              ) : (
                <div className="deposit-qr__no-qr">
                  <p>QR code not available. Please use the reference code below for manual transfer.</p>
                </div>
              )}

              <div className="deposit-qr__ref">
                <span className="deposit-qr__ref-label">Reference Code (include in transfer description)</span>
                <div className="deposit-qr__ref-row">
                  <code className="deposit-qr__ref-code">{result.referenceCode}</code>
                  <button type="button" className="deposit-qr__copy" onClick={handleCopy}>
                    {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="deposit-qr__note">
                <CheckCircle size={14} />
                Your deposit will be credited after admin verification. This usually takes a few hours.
              </div>

              <button type="button" className="ui-btn ui-btn--primary ui-btn--md deposit-qr__done" onClick={onClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
