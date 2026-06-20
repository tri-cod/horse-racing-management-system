import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, TrendingUp } from 'lucide-react';
import { getBalance } from '../api/walletApi';
import DepositModal from '../components/wallet/DepositModal';
import '../assets/css/wallet/MyWalletPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function MyWalletPage() {
  const [balance, setBalance]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showDeposit, setShowDeposit] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getBalance();
      setBalance(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load wallet.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return (
    <div className="my-wallet-page">
      <section className="my-wallet-page__hero">
        <div className="my-wallet-page__hero-inner">
          <span className="eyebrow my-wallet-page__eyebrow">My Account</span>
          <h1 className="my-wallet-page__hero-title">My Wallet</h1>
          <p className="my-wallet-page__hero-sub">Manage your balance and deposit funds to place bets.</p>
        </div>
      </section>

      <div className="my-wallet-page__body">
        <div className="wallet-card">
          <div className="wallet-card__icon"><Wallet size={28} /></div>
          <div className="wallet-card__content">
            <span className="wallet-card__label">Available Balance</span>
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
              className="ui-btn ui-btn--primary ui-btn--sm"
              onClick={() => setShowDeposit(true)}
            >
              <Plus size={14} /> Deposit
            </button>
          </div>
        </div>

        <div className="wallet-info">
          <div className="wallet-info__item">
            <TrendingUp size={16} />
            <div>
              <span className="wallet-info__title">How deposits work</span>
              <p className="wallet-info__desc">
                Submit a deposit request and transfer the exact amount via VietQR. Your balance will be updated after admin verification (usually within a few hours).
              </p>
            </div>
          </div>
        </div>
      </div>

      <DepositModal
        open={showDeposit}
        onClose={() => setShowDeposit(false)}
        onSuccess={fetchBalance}
      />
    </div>
  );
}
