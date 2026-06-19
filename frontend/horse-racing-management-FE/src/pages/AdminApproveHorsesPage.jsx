import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { getPendingHorses, approveRaceHorse, rejectRaceHorse } from '../api/raceHorseApi';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminApproveHorsesPage() {
  const addToast = useToast();
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } finally {
      setActionLoading(null);
    }
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
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
<div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {horses.length} pending request{horses.length !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <AlertTriangle size={16} /> {error}
            <button onClick={fetchPending} style={{ marginLeft: 'auto', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontSize: '13px' }}>
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : horses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)', fontSize: '15px' }}>
            No pending requests.
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--black-5)', borderBottom: '1px solid var(--border)' }}>
                  {['Horse', 'Jockey', 'Race', 'Registered At', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horses.map((rh) => {
                  const busy = actionLoading === rh.id;
                  return (
                    <tr key={rh.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text)' }}>
                        {rh.horseName ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {rh.jockeyName ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text)' }}>
                        {rh.raceName ?? '—'}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {formatDate(rh.registerAt)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(rh)}
                            disabled={busy}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', border: 'none', borderRadius: '6px', background: '#16a34a', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(rh)}
                            disabled={busy}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', border: '1px solid var(--border)', borderRadius: '6px', background: 'transparent', color: '#b91c1c', fontSize: '12px', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}
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
        )}
      </div>
    </div>
  );
}
