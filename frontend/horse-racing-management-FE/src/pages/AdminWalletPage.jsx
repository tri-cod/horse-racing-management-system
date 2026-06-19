import { useState, useEffect, useCallback } from 'react';
import { Landmark, RefreshCw, ShieldCheck } from 'lucide-react';
import { getSystemBalance } from '../api/walletApi';
import '../assets/css/wallet/MyWalletPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function AdminWalletPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getSystemBalance();
      setBalance(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load system balance.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return (
    <div className="my-wallet-page">
      <section className="my-wallet-page__hero">
        <div className="my-wallet-page__hero-inner">
          <span className="eyebrow my-wallet-page__eyebrow">System</span>
          <h1 className="my-wallet-page__hero-title">System Wallet</h1>
          <p className="my-wallet-page__hero-sub">Balance accumulated from losing bets across the system.</p>
        </div>
      </section>

      <div className="my-wallet-page__body">
        <div className="wallet-card">
          <div className="wallet-card__icon">
            <Landmark size={28} />
          </div>
          <div className="wallet-card__content">
            <span className="wallet-card__label">System Balance</span>
            {loading ? (
              <div className="wallet-card__skeleton" />
            ) : error ? (
              <span className="wallet-card__error">{error}</span>
            ) : (
              <span className="wallet-card__balance">{fmt(balance)}</span>
            )}
          </div>
          <div className="wallet-card__actions">
            <button
              type="button"
              className="ui-btn ui-btn--outline ui-btn--sm"
              onClick={fetchBalance}
              disabled={loading}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="wallet-info">
          <div className="wallet-info__item">
            <ShieldCheck size={16} />
            <div>
              <span className="wallet-info__title">What is the system balance?</span>
              <p className="wallet-info__desc">
                This is the total amount from losing bets transferred into the system wallet after each race ends. Only Admins and Staff can view this balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
