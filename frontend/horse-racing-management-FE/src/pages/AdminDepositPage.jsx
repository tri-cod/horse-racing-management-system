import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, DollarSign, Landmark, Building2, RefreshCw } from 'lucide-react';
import {
  getPendingDeposits, approveDeposit, rejectDeposit,
  getPendingWithdraws, approveWithdraw, rejectWithdraw,
  getSystemBalance,
} from '../api/walletApi';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardPageHeader from '../components/rd/DashboardPageHeader';
import StatCard from '../components/rd/StatCard';
import Seo from '../components/seo/Seo';
import '../assets/css/admin/AdminDepositPage.css';
import '../assets/css/rd/workspace.css';

const fmt = (n) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

// ── Confirm Modal ─────────────────────────────────────────
function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, variant = 'primary' }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <div className="modal-dialog modal-dialog--sm" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3 className="modal-title">{title}</h3></div>
        <div className="modal-body">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{message}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-5)' }}>
            <button className="ui-btn ui-btn--outline ui-btn--md" onClick={onCancel} disabled={loading}>Cancel</button>
            <button className={`ui-btn ui-btn--${variant} ui-btn--md`} onClick={onConfirm} disabled={loading}>
              {loading ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared table row components ───────────────────────────
function UserCell({ user }) {
  return (
    <div className="adep-table__user">
      <div className="adep-table__avatar"><User size={14} /></div>
      <div>
        <span className="adep-table__username">{user?.username ?? user?.fullName ?? `User #${user?.id}`}</span>
        {user?.email && <span className="adep-table__email">{user.email}</span>}
      </div>
    </div>
  );
}

// ── Deposit Tab ───────────────────────────────────────────
function DepositTab({ systemBalance }) {
  const addToast = useToast();
  const [deposits, setDeposits]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal]   = useState({ open: false, type: '', item: null });

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getPendingDeposits();
      // Lọc chỉ DEPOSIT (endpoint trả về tất cả pending)
      const filtered = Array.isArray(data) ? data.filter((d) => d.requestType === 'DEPOSIT') : [];
      setDeposits(filtered);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load deposit requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const handleConfirm = async () => {
    const { type, item } = confirmModal;
    try {
      setActionLoading(true);
      if (type === 'approve') {
        await approveDeposit(item.id, 'Approved by admin');
        addToast(`Approved ${fmt(item.amount)} for ${item.user?.username ?? 'user'}`, 'success');
      } else {
        await rejectDeposit(item.id, 'Rejected by admin');
        addToast('Deposit rejected', 'error');
      }
      setConfirmModal({ open: false, type: '', item: null });
      fetchDeposits();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPending = deposits.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  return (
    <>
      <div className="ws-stat-row">
        <StatCard icon={Clock}      label="Pending Deposits"  value={deposits.length}                                       tileVariant="default" />
        <StatCard icon={DollarSign} label="Total Pending"     value={fmt(totalPending)}                                     tileVariant="brass" />
        <StatCard icon={Landmark}   label="System Balance"    value={systemBalance != null ? fmt(systemBalance) : '—'}      tileVariant="ok" />
      </div>

      {error && (
        <div className="ws-error">
          <span>{error}</span>
          <button className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchDeposits}>Retry</button>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && !error && deposits.length === 0 && (
        <div className="ws-panel">
          <div className="ws-empty">
            <CheckCircle size={40} className="ws-empty__icon" style={{ color: 'var(--ok)' }} />
            <p className="ws-empty__title">All caught up!</p>
            <p>No pending deposit requests at the moment.</p>
          </div>
        </div>
      )}

      {!loading && !error && deposits.length > 0 && (
        <div className="ws-panel">
          <div className="ws-panel__header">
            <h2 className="ws-panel__title">Pending Deposits</h2>
            <button className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchDeposits}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>User</th><th>Amount</th><th>Reference</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((dep) => (
                  <tr key={dep.id}>
                    <td><UserCell user={dep.user} /></td>
                    <td><strong className="adep-table__amount tnum">{fmt(dep.amount)}</strong></td>
                    <td><code className="adep-table__ref">{dep.referenceCode ?? '—'}</code></td>
                    <td className="adep-table__date tnum">{fmtDate(dep.createdAt)}</td>
                    <td><span className="adep-badge adep-badge--pending"><Clock size={11} /> Pending</span></td>
                    <td>
                      <div className="adep-table__actions">
                        <button className="ui-btn ui-btn--primary ui-btn--sm"
                          onClick={() => setConfirmModal({ open: true, type: 'approve', item: dep })}>
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button className="ui-btn ui-btn--danger ui-btn--sm"
                          onClick={() => setConfirmModal({ open: true, type: 'reject', item: dep })}>
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
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.type === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
        message={
          confirmModal.item
            ? `${confirmModal.type === 'approve' ? 'Approve' : 'Reject'} deposit of ${fmt(confirmModal.item.amount)} from ${confirmModal.item.user?.username ?? 'this user'}?`
            : ''
        }
        variant={confirmModal.type === 'approve' ? 'primary' : 'dark'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false, type: '', item: null })}
        loading={actionLoading}
      />
    </>
  );
}

// ── Withdraw Tab ──────────────────────────────────────────
function WithdrawTab() {
  const addToast = useToast();
  const [withdraws, setWithdraws]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal]   = useState({ open: false, type: '', item: null });

  const fetchWithdraws = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getPendingWithdraws();
      setWithdraws(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load withdraw requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWithdraws(); }, [fetchWithdraws]);

  const handleConfirm = async () => {
    const { type, item } = confirmModal;
    try {
      setActionLoading(true);
      if (type === 'approve') {
        await approveWithdraw(item.id, 'Approved by admin');
        addToast(`Approved withdrawal of ${fmt(item.amount)} for ${item.user?.username ?? 'user'}`, 'success');
      } else {
        await rejectWithdraw(item.id, 'Rejected by admin');
        addToast('Withdrawal rejected. Amount refunded to user.', 'error');
      }
      setConfirmModal({ open: false, type: '', item: null });
      fetchWithdraws();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // verifyNote chứa "Bank: <name> - <holder> - <number>"
  const parseBankInfo = (note) => {
    if (!note) return null;
    const match = note.match(/Bank:\s*(.+?)\s*-\s*(.+?)\s*-\s*(.+)$/);
    if (!match) return null;
    return { bankName: match[1], holder: match[2], number: match[3] };
  };

  const totalPending = withdraws.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  return (
    <>
      <div className="ws-stat-row">
        <StatCard icon={Clock}      label="Pending Withdrawals" value={withdraws.length}   tileVariant="default" />
        <StatCard icon={DollarSign} label="Total to Transfer"   value={fmt(totalPending)}  tileVariant="brass" />
      </div>

      {error && (
        <div className="ws-error">
          <span>{error}</span>
          <button className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchWithdraws}>Retry</button>
        </div>
      )}

      {loading && <LoadingSpinner />}

      {!loading && !error && withdraws.length === 0 && (
        <div className="ws-panel">
          <div className="ws-empty">
            <CheckCircle size={40} className="ws-empty__icon" style={{ color: 'var(--ok)' }} />
            <p className="ws-empty__title">No pending withdrawals</p>
            <p>All withdrawal requests have been processed.</p>
          </div>
        </div>
      )}

      {!loading && !error && withdraws.length > 0 && (
        <div className="ws-panel">
          <div className="ws-panel__header">
            <h2 className="ws-panel__title">Pending Withdrawals</h2>
            <button className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchWithdraws}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <div className="ws-table-wrap">
            <table className="ws-table">
              <thead>
                <tr>
                  <th>User</th><th>Amount</th><th>Bank Account</th><th>Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdraws.map((wd) => {
                  const bank = parseBankInfo(wd.verifyNote);
                  return (
                    <tr key={wd.id}>
                      <td><UserCell user={wd.user} /></td>
                      <td><strong className="adep-table__amount tnum">{fmt(wd.amount)}</strong></td>
                      <td>
                        {bank ? (
                          <div className="adep-bank-info">
                            <Building2 size={13} className="adep-bank-info__icon" />
                            <div>
                              <span className="adep-bank-info__name">{bank.bankName}</span>
                              <span className="adep-bank-info__holder">{bank.holder}</span>
                              <code className="adep-bank-info__number">{bank.number}</code>
                            </div>
                          </div>
                        ) : (
                          <span className="adep-table__date">—</span>
                        )}
                      </td>
                      <td className="adep-table__date tnum">{fmtDate(wd.createdAt)}</td>
                      <td><span className="adep-badge adep-badge--pending"><Clock size={11} /> Pending</span></td>
                      <td>
                        <div className="adep-table__actions">
                          <button className="ui-btn ui-btn--primary ui-btn--sm"
                            onClick={() => setConfirmModal({ open: true, type: 'approve', item: wd })}>
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button className="ui-btn ui-btn--danger ui-btn--sm"
                            onClick={() => setConfirmModal({ open: true, type: 'reject', item: wd })}>
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.type === 'approve' ? 'Approve Withdrawal' : 'Reject Withdrawal'}
        message={
          confirmModal.item
            ? confirmModal.type === 'approve'
              ? `Confirm transfer of ${fmt(confirmModal.item.amount)} to ${confirmModal.item.user?.username ?? 'user'}? This means you've already sent the money via bank transfer.`
              : `Reject withdrawal of ${fmt(confirmModal.item.amount)}? The amount will be refunded to the user's wallet.`
            : ''
        }
        variant={confirmModal.type === 'approve' ? 'primary' : 'dark'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false, type: '', item: null })}
        loading={actionLoading}
      />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminDepositPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'withdraw' ? 'withdraw' : 'deposit');
  const [systemBalance, setSystemBalance] = useState(null);

  useEffect(() => {
    getSystemBalance().then(setSystemBalance).catch(() => {});
  }, []);

  return (
    <div className="ws-page">
      <Seo title="Transaction Requests" description="Review and approve pending deposits and withdrawals." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Transaction Requests"
        subtitle="Review and process pending deposit and withdrawal requests."
      />

      <div className="ws-body">
        {/* Tab switcher */}
        <div className="adep-tabs">
          <button
            className={`adep-tabs__btn${activeTab === 'deposit' ? ' active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            <DollarSign size={15} /> Deposits
          </button>
          <button
            className={`adep-tabs__btn${activeTab === 'withdraw' ? ' active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <Building2 size={15} /> Withdrawals
          </button>
        </div>

        {activeTab === 'deposit'  && <DepositTab systemBalance={systemBalance} />}
        {activeTab === 'withdraw' && <WithdrawTab />}
      </div>
    </div>
  );
}