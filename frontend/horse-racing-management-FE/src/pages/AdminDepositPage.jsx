import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { getPendingDeposits, approveDeposit, rejectDeposit } from '../api/walletApi';
import '../assets/css/wallet/AdminDepositPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—';

/* ── Note Modal ── */
function NoteModal({ open, type, onConfirm, onClose, loading }) {
  const [note, setNote] = useState('');
  useEffect(() => { if (open) setNote(''); }, [open]);
  if (!open) return null;

  const isApprove = type === 'approve';

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal-dialog modal-dialog--sm admin-note-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow" style={{ color: isApprove ? '#15803d' : '#dc2626' }}>
              {isApprove ? 'Approve' : 'Reject'} Deposit
            </span>
            <h3 className="modal-title">
              {isApprove ? 'Confirm Approval' : 'Confirm Rejection'}
            </h3>
          </div>
        </div>
        <div className="modal-body">
          <div className="admin-note-modal__body">
            <div className="admin-note-modal__field">
              <label className="admin-note-modal__label">Note (optional)</label>
              <textarea
                className="admin-note-modal__textarea"
                rows={3}
                placeholder={isApprove ? 'e.g. Payment verified via bank statement' : 'e.g. Reference code not found'}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="admin-note-modal__actions">
              <button className="ui-btn ui-btn--outline ui-btn--md" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button
                className={`ui-btn ui-btn--md ${isApprove ? 'ui-btn--primary' : 'admin-note-modal__btn-reject'}`}
                onClick={() => onConfirm(note || 'N/A')}
                disabled={loading}
              >
                {loading ? 'Processing…' : isApprove ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminDepositPage() {
  const [deposits, setDeposits]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal]               = useState({ open: false, type: '', id: null });
  const [toast, setToast]               = useState('');

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

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleConfirm = async (note) => {
    try {
      setActionLoading(true);
      if (modal.type === 'approve') {
        await approveDeposit(modal.id, note);
        showToast('Deposit approved successfully.');
      } else {
        await rejectDeposit(modal.id, note);
        showToast('Deposit rejected.');
      }
      setModal({ open: false, type: '', id: null });
      fetchDeposits();
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-deposit-page">

      {/* Hero */}
      <section className="admin-deposit-page__hero">
        <div className="admin-deposit-page__hero-inner">
          <span className="eyebrow admin-deposit-page__eyebrow">Admin Panel</span>
          <h1 className="admin-deposit-page__title">Deposit Requests</h1>
          <p className="admin-deposit-page__sub">Review and approve pending deposit requests from users.</p>
        </div>
      </section>

      <div className="admin-deposit-page__body">

        {/* Toast */}
        {toast && (
          <div className="admin-deposit-page__toast">
            <CheckCircle size={16} /> {toast}
          </div>
        )}

        {/* Toolbar */}
        <div className="admin-deposit-page__toolbar">
          <div className="admin-deposit-page__count">
            <Clock size={16} />
            <span><strong>{deposits.length}</strong> pending request{deposits.length !== 1 ? 's' : ''}</span>
          </div>
          <button
            type="button"
            className="ui-btn ui-btn--outline ui-btn--sm"
            onClick={fetchDeposits}
            disabled={loading}
          >
            <RefreshCw size={13} style={loading ? { animation: 'spin .7s linear infinite' } : {}} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="admin-deposit-page__error">
            <AlertCircle size={15} /> {error}
            <button type="button" onClick={fetchDeposits}>Retry</button>
          </div>
        )}

        {/* Skeleton */}
        {loading && !error && (
          <div className="admin-deposit-page__skeletons">
            {[1,2,3].map((i) => <div key={i} className="deposit-skeleton" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && deposits.length === 0 && (
          <div className="admin-deposit-page__empty">
            <CheckCircle size={48} />
            <h3>All caught up!</h3>
            <p>No pending deposit requests at the moment.</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && deposits.length > 0 && (
          <div className="deposit-table-wrap">
            <table className="deposit-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Reference Code</th>
                  <th>Method</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((dep) => (
                  <tr key={dep.id} className="deposit-table__row">
                    <td>
                      <div className="deposit-table__user">
                        <div className="deposit-table__avatar">
                          {dep.user?.username?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div>
                          <span className="deposit-table__username">{dep.user?.username ?? `User #${dep.userId}`}</span>
                          <span className="deposit-table__email">{dep.user?.email ?? '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="deposit-table__amount">{fmt(dep.amount)}</td>
                    <td>
                      <code className="deposit-table__ref">{dep.referenceCode ?? '—'}</code>
                    </td>
                    <td className="deposit-table__method">{dep.paymentMethod ?? '—'}</td>
                    <td className="deposit-table__date">{fmtDate(dep.createdAt)}</td>
                    <td>
                      <div className="deposit-table__actions">
                        <button
                          type="button"
                          className="deposit-table__btn deposit-table__btn--approve"
                          onClick={() => setModal({ open: true, type: 'approve', id: dep.id })}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          className="deposit-table__btn deposit-table__btn--reject"
                          onClick={() => setModal({ open: true, type: 'reject', id: dep.id })}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NoteModal
        open={modal.open}
        type={modal.type}
        onConfirm={handleConfirm}
        onClose={() => setModal({ open: false, type: '', id: null })}
        loading={actionLoading}
      />
    </div>
  );
}
