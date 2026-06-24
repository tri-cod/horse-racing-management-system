import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getPendingHorses, approveRaceHorse, rejectRaceHorse } from '../api/raceHorseApi';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DashboardPageHeader from '../components/rd/DashboardPageHeader';
import Silk from '../components/rd/Silk';
import Seo from '../components/seo/Seo';
import '../assets/css/rd/workspace.css';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminApproveHorsesPage() {
  const addToast = useToast();
  const [horses, setHorses]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getPendingHorses();
      setHorses(data ?? []);
    } catch {
      setError('Unable to load list. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (rh) => {
    setActionLoading(rh.id);
    try {
      await approveRaceHorse(rh.id);
      addToast(`Horse "${rh.horseName}" approved`, 'success');
      setHorses((prev) => prev.filter((h) => h.id !== rh.id));
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Approval failed.', 'error');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (rh) => {
    if (!window.confirm(`Reject horse "${rh.horseName}"?`)) return;
    setActionLoading(rh.id);
    try {
      await rejectRaceHorse(rh.id);
      addToast(`Horse "${rh.horseName}" rejected`, 'info');
      setHorses((prev) => prev.filter((h) => h.id !== rh.id));
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Rejection failed.', 'error');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="ws-page">
      <Seo title="Approve Horses" description="Review and approve horse race registrations." />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Approve Horses"
        subtitle={`${horses.length} pending request${horses.length !== 1 ? 's' : ''}`}
      />

      <div className="ws-body">
        {error && <div className="ws-error"><AlertTriangle size={16} /> {error}<button onClick={fetchPending}>Retry</button></div>}

        {loading ? <LoadingSpinner /> : horses.length === 0 ? (
          <div className="ws-panel">
            <div className="ws-empty">
              <CheckCircle size={40} className="ws-empty__icon" style={{ color: 'var(--ok)' }} />
              <p className="ws-empty__title">All clear!</p>
              <p>No pending horse registration requests.</p>
            </div>
          </div>
        ) : (
          <div className="ws-panel">
            <div className="ws-table-wrap">
              <table className="ws-table">
                <thead>
                  <tr><th>Horse</th><th>Jockey</th><th>Race</th><th>Registered At</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {horses.map((rh) => {
                    const busy = actionLoading === rh.id;
                    return (
                      <tr key={rh.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Silk variant={(rh.id % 6) + 1} size={22} />
                            <strong>{rh.horseName ?? '—'}</strong>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{rh.jockeyName ?? '—'}</td>
                        <td>{rh.raceName ?? '—'}</td>
                        <td className="tnum" style={{ color: 'var(--text-muted)' }}>{formatDate(rh.registerAt)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleApprove(rh)} disabled={busy}
                              className="ui-btn ui-btn--primary ui-btn--sm"
                            >
                              <CheckCircle size={13} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(rh)} disabled={busy}
                              className="ui-btn ui-btn--outline ui-btn--sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              <XCircle size={13} /> Reject
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
      </div>
    </div>
  );
}
