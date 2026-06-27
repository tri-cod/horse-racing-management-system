import { useState, useEffect, useCallback } from 'react';
import { Wallet, Plus, TrendingUp, Info } from 'lucide-react';
import { getBalance } from '../../api/walletApi';
import DepositModal from '../../components/wallet/DepositModal';
import DashboardPageHeader from '../../components/shared/DashboardPageHeader';
import Seo from '../../components/seo/Seo';
import '../../assets/css/wallet/MyWalletPage.css';
import '../../assets/css/shared/workspace.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function MyWalletPage() {
  const [balance, setBalance]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
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
    <div className="ws-page">
      <Seo title="My Wallet" description="Manage your Royal Derby wallet balance." />
      <DashboardPageHeader
        eyebrow="My Account"
        title="My Wallet"
        subtitle="Manage your balance and deposit funds to place bets."
        action={
          <button
            type="button"
            className="ui-btn ui-btn--dark ui-btn--md"
            onClick={() => setShowDeposit(true)}
          >
            <Plus size={15} /> Deposit Funds
          </button>
        }
      />

      <div className="ws-body ws-body--narrow">
        {/* Balance card */}
        <div className="ws-panel">
          <div className="ws-panel__header">
            <h2 className="ws-panel__title">Available Balance</h2>
          </div>
          <div className="ws-panel__body">
            <div className="wallet-card" style={{ border: 'none', borderRadius: 0, boxShadow: 'none', padding: 0 }}>
              <div className="wallet-card__icon"><Wallet size={28} /></div>
              <div className="wallet-card__content">
                <span className="wallet-card__label">Total Balance</span>
                {loading ? (
                  <div className="wallet-card__skeleton" />
                ) : error ? (
                  <span className="wallet-card__error">{error}</span>
                ) : (
                  <span className="wallet-card__balance tnum">{fmt(balance)}</span>
                )}
              </div>
              <div className="wallet-card__actions">
                <button type="button" className="ui-btn ui-btn--dark ui-btn--sm" onClick={() => setShowDeposit(true)}>
                  <Plus size={14} /> Deposit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="ws-panel">
          <div className="ws-panel__header">
            <h2 className="ws-panel__title">How It Works</h2>
          </div>
          <div className="ws-panel__body">
            <div className="wallet-info" style={{ border: 'none', borderRadius: 0, background: 'none', padding: 0 }}>
              <div className="wallet-info__item">
                <TrendingUp size={16} />
                <div>
                  <span className="wallet-info__title">Deposit via VietQR</span>
                  <p className="wallet-info__desc">
                    Submit a deposit request and transfer the exact amount via VietQR. Your balance will be updated after admin verification (usually within a few hours).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DepositModal open={showDeposit} onClose={() => setShowDeposit(false)} onSuccess={fetchBalance} />
    </div>
  );
}
