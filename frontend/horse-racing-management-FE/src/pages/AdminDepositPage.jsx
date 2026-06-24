import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, User, DollarSign, Landmark } from 'lucide-react';
import { getPendingDeposits, approveDeposit, rejectDeposit, getSystemBalance } from '../api/walletApi';
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

export default function AdminDepositPage() {
  const addToast = useToast();
  const [deposits, setDeposits]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [systemBalance, setSystemBalance] = useState(null);
  const [confirmModal, setConfirmModal]   = useState({ open: false, type: '', deposit: null });

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const data = await getPendingDeposits();
      setDeposits(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load deposit requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
    getSystemBalance().then(setSystemBalance).catch(() => {});
  }, [fetchDeposits]);

  const openConfirm  = (type, deposit) => setConfirmModal({ open: true, type, deposit });
  const closeConfirm = () => setConfirmModal({ open: false, type: '', deposit: null });

  const handleConfirm = async () => {
    const { type, deposit } = confirmModal;
    try {
      setActionLoading(true);
      if (type === 'approve') {
        await approveDeposit(deposit.id, 'Approved by admin');
        addToast(`Approved ${fmt(deposit.amount)} for ${deposit.user?.username ?? 'user'}`, 'success');
      } else {
        await rejectDeposit(deposit.id, 'Rejected by admin');
        addToast(`Rejected deposit`, 'error');
      }
      closeConfirm();
      fetchDeposits();
    } catch (e) {
      addToast(e?.response?.data?.message || 'Action failed.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPending = deposits.reduce((s, d) => s + (Number(d.amount) || 0), 0);

  return (
    <div className="ws-page">
      <Seo title="Deposit Requests" description="Review and approve pending deposit requests." />
      <DashboardPageHeader eyebrow="Admin" title="Deposit Requests" subtitle="Review and approve pending user deposits" />

      <div className="ws-body">
        {/* Stats */}
        <div className="ws-stat-row">
          <StatCard icon={Clock}    label="Pending"        value={deposits.length}           tileVariant="default" />
          <StatCard icon={DollarSign} label="Total Pending" value={fmt(totalPending)}         tileVariant="brass" />
          <StatCard icon={Landmark} label="System Balance"  value={systemBalance != null ? fmt(systemBalance) : '—'} tileVariant="ok" />
        </div>

        {error && <div className="ws-error"><span>{error}</span><button className="ui-btn ui-btn--outline ui-btn--sm" onClick={fetchDeposits}>Retry</button></div>}

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
                      <td>
                        <div className="adep-table__user">
                          <div className="adep-table__avatar"><User size={14} /></div>
                          <div>
                            <span className="adep-table__username">{dep.user?.username ?? dep.user?.fullName ?? `User #${dep.user?.id}`}</span>
                            {dep.user?.email && <span className="adep-table__email">{dep.user.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td><strong className="adep-table__amount tnum">{fmt(dep.amount)}</strong></td>
                      <td><code className="adep-table__ref">{dep.referenceCode ?? '—'}</code></td>
                      <td className="adep-table__date tnum">{fmtDate(dep.createdAt)}</td>
                      <td><span className="adep-badge adep-badge--pending"><Clock size={11} /> Pending</span></td>
                      <td>
                        <div className="adep-table__actions">
                          <button className="ui-btn ui-btn--primary ui-btn--sm" onClick={() => openConfirm('approve', dep)}>
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button className="ui-btn ui-btn--danger ui-btn--sm" onClick={() => openConfirm('reject', dep)}>
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
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.type === 'approve' ? 'Approve Deposit' : 'Reject Deposit'}
        message={
          confirmModal.deposit
            ? `${confirmModal.type === 'approve' ? 'Approve' : 'Reject'} deposit of ${fmt(confirmModal.deposit.amount)} from ${confirmModal.deposit.user?.username ?? 'this user'}?`
            : ''
        }
        variant={confirmModal.type === 'approve' ? 'primary' : 'dark'}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
        loading={actionLoading}
      />
    </div>
  );
}
