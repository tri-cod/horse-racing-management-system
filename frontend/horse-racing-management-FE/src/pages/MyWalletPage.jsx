import { useState, useEffect, useCallback, useContext } from 'react';
import { Wallet, Plus, RefreshCw, ArrowDownCircle, Shield, Clock } from 'lucide-react';
import { getBalance } from '../api/walletApi';
import DepositModal from '../components/wallet/DepositModal';
import { AuthContext } from '../context/AuthContext';
import '../assets/css/wallet/MyWalletPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

export default function MyWalletPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositOpen, setDepositOpen] = useState(false);
  const [justDeposited, setJustDeposited] = useState(false);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'ADMIN';

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getBalance();
      setBalance(data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load wallet balance.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const handleDepositSuccess = () => {
    setJustDeposited(true);
    fetchBalance();
    setTimeout(() => setJustDeposited(false), 5000);
  };

  return (
    <div className="my-wallet-page">

      {/* ── Hero ── */}
      <section className="my-wallet-page__hero">
        <div className="my-wallet-page__hero-inner">
          <span className="eyebrow my-wallet-page__eyebrow">My Account</span>
          <h1 className="my-wallet-page__hero-title">My Wallet</h1>
          <p className="my-wallet-page__hero-sub">
            Manage your balance and deposit funds to place bets.
          </p>
        </div>
      </section>

      <div className="my-wallet-page__body">

        {/* Balance card */}
        <div className="wallet-card">
          <div className="wallet-card__top">
            <div className="wallet-card__icon-wrap">
              <Wallet size={24} />
            </div>
            <span className="wallet-card__label">Available Balance</span>
          </div>

          {loading ? (
            <div className="wallet-card__skeleton" />
          ) : error ? (
            <div className="wallet-card__error">{error}</div>
          ) : (
            <div className="wallet-card__amount">{fmt(balance)}</div>
          )}

          <div className="wallet-card__actions">
            <button
              type="button"
              className="ui-btn ui-btn--outline ui-btn--sm"
              onClick={fetchBalance}
              disabled={loading}
            >
              <RefreshCw size={13} style={loading ? { animation: 'spin .7s linear infinite' } : {}} />
              Refresh
            </button>
            {!isAdmin && (
              <button
                type="button"
                className="ui-btn ui-btn--primary ui-btn--lg"
                onClick={() => setDepositOpen(true)}
              >
                <Plus size={18} />
                Deposit Funds
              </button>
            )}
          </div>
        </div>

        {/* Success banner after deposit */}
        {justDeposited && (
          <div className="wallet-deposit-success">
            <Clock size={16} />
            Deposit request submitted! Your balance will be updated after admin approval.
          </div>
        )}

        {/* Info cards */}
        <div className="wallet-info-grid">
          <div className="wallet-info-card">
            <div className="wallet-info-card__icon wallet-info-card__icon--blue">
              <ArrowDownCircle size={20} />
            </div>
            <div>
              <strong>Deposit via VietQR</strong>
              <p>Scan the QR code with any Vietnamese banking app to transfer funds instantly.</p>
            </div>
          </div>
          <div className="wallet-info-card">
            <div className="wallet-info-card__icon wallet-info-card__icon--green">
              <Shield size={20} />
            </div>
            <div>
              <strong>Admin Verified</strong>
              <p>All deposits are manually verified by our team before being credited to your wallet.</p>
            </div>
          </div>
          <div className="wallet-info-card">
            <div className="wallet-info-card__icon wallet-info-card__icon--gold">
              <Clock size={20} />
            </div>
            <div>
              <strong>Processing Time</strong>
              <p>Deposits are typically approved within a few hours during business hours.</p>
            </div>
          </div>
        </div>

        {/* How to deposit */}
        <div className="wallet-steps">
          <h3 className="wallet-steps__title">How to Deposit</h3>
          <div className="wallet-steps__list">
            {[
              { n: 1, title: 'Enter Amount', desc: 'Click "Deposit Funds" and enter the amount you want to add.' },
              { n: 2, title: 'Scan QR Code', desc: 'Use any Vietnamese banking app to scan the VietQR code and complete the transfer.' },
              { n: 3, title: 'Include Reference', desc: 'Make sure to include the reference code in your transfer description.' },
              { n: 4, title: 'Wait for Approval', desc: 'Our admin team will verify and credit your wallet.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="wallet-steps__item">
                <div className="wallet-steps__num">{n}</div>
                <div className="wallet-steps__body">
                  <strong>{title}</strong>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      {!isAdmin && (
        <DepositModal
          open={depositOpen}
          onClose={() => setDepositOpen(false)}
          onSuccess={handleDepositSuccess}
        />
      )}
    </div>
  );
}
