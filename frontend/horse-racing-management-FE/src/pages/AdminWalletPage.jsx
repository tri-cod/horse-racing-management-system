import { useState, useEffect, useCallback } from 'react';
import { Landmark, RefreshCw, ShieldCheck, TrendingDown } from 'lucide-react';
import { getSystemBalance } from '../api/walletApi';
import DashboardPageHeader from '../components/rd/DashboardPageHeader';
import StatCard from '../components/rd/StatCard';
import Seo from '../components/seo/Seo';
import '../assets/css/wallet/MyWalletPage.css';
import '../assets/css/rd/workspace.css';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

export default function AdminWalletPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true); setError('');
      setBalance(await getSystemBalance());
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load system balance.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return (
    <div className="ws-page">
      <Seo title="System Wallet" description="View the Royal Derby system wallet balance." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="System Wallet"
        subtitle="Balance accumulated from losing bets across the system"
        action={
          <button type="button" className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchBalance} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      <div className="ws-body ws-body--narrow">
        <div className="ws-stat-row">
          <StatCard icon={Landmark} label="System Balance" value={loading ? '…' : error ? 'Error' : fmt(balance)} tileVariant="brass" />
          <StatCard icon={TrendingDown} label="Source" value="Lost Bets" tileVariant="default" />
        </div>

        <div className="ws-panel">
          <div className="ws-panel__header">
            <h2 className="ws-panel__title">About System Wallet</h2>
          </div>
          <div className="ws-panel__body">
            <div className="wallet-info" style={{ border: 'none', borderRadius: 0, background: 'none', padding: 0 }}>
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
      </div>
    </div>
  );
}
