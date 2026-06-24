import { useContext, useEffect, useState, useCallback } from 'react';
import { Play, CheckSquare, Trophy, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SetResultModal from '../components/referee/SetResultModal';
import { getAllRaces, startRace, finishRace } from '../api/refereeApi';
import DashboardPageHeader from '../components/rd/DashboardPageHeader';
import Seo from '../components/seo/Seo';
import '../assets/css/RefereeRacesPage.css';
import '../assets/css/rd/workspace.css';

const STATUS_ORDER = { ONGOING: 0, CLOSED_REGISTRATION: 1, OPEN_REGISTRATION: 2, UPCOMING: 3, FINISHED: 4, CANCELLED: 5 };

function normalizeStatus(status) {
  if (!status) return 'UNKNOWN';
  const s = String(status).trim().toUpperCase();
  const map = { UPCOMING: 'UPCOMING', OPEN_REGISTRATION: 'OPEN_REGISTRATION', CLOSED_REGISTRATION: 'CLOSED_REGISTRATION',
    ONGOING: 'ONGOING', FINISHED: 'FINISHED', COMPLETED: 'FINISHED', CANCELLED: 'CANCELLED',
    CANCEL: 'CANCELLED', CANCELED: 'CANCELLED', LIVE: 'ONGOING' };
  return map[s] ?? s;
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const map = {
    UPCOMING:             { label: 'Upcoming',            cls: 'ref-badge--upcoming'  },
    OPEN_REGISTRATION:    { label: 'Open Registration',   cls: 'ref-badge--upcoming'  },
    CLOSED_REGISTRATION:  { label: 'Closed Registration', cls: 'ref-badge--closed'    },
    ONGOING:              { label: 'Live',                cls: 'ref-badge--ongoing'   },
    FINISHED:             { label: 'Finished',            cls: 'ref-badge--finished'  },
    CANCELLED:            { label: 'Cancelled',           cls: 'ref-badge--cancelled' },
  };
  const { label, cls } = map[key] ?? { label: status, cls: '' };
  return <span className={`ref-badge ${cls}`}>{label}</span>;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrize(n) {
  if (!n) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}

export default function RefereeRacesPage() {
  const { user } = useContext(AuthContext);
  const addToast = useToast();

  const [races, setRaces]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [setResultRace, setSetResultRace] = useState(null);

  const fetchRaces = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getAllRaces({ size: 100 });
      const list = data?.content ?? [];
      setRaces([...list].sort((a, b) =>
        (STATUS_ORDER[normalizeStatus(a.status)] ?? 9) - (STATUS_ORDER[normalizeStatus(b.status)] ?? 9)
      ));
    } catch {
      setError('Failed to load races. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRaces(); }, [fetchRaces]);

  const handleStart = async (race) => {
    if (!window.confirm(`Start race "${race.raceName}"?`)) return;
    setActionLoading(race.id);
    try {
      await startRace(race.id);
      addToast(`Race "${race.raceName}" started!`, 'success');
      fetchRaces();
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to start race.', 'error');
    } finally { setActionLoading(null); }
  };

  const handleFinish = async (race) => {
    if (!window.confirm(`Finish race "${race.raceName}"?`)) return;
    setActionLoading(race.id);
    try {
      await finishRace(race.id);
      addToast(`Race "${race.raceName}" finished!`, 'success');
      fetchRaces();
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to finish race.', 'error');
    } finally { setActionLoading(null); }
  };

  const onResultSaved = () => {
    setSetResultRace(null);
    addToast('Results saved!', 'success');
    fetchRaces();
  };

  return (
    <div className="ws-page">
      <Seo title="Race Control" description="Manage race proceedings as a Royal Derby referee." />
      <DashboardPageHeader
        eyebrow="Referee"
        title="Race Control"
        subtitle={`${races.length} races in the system`}
      />

      <div className="ws-body">
        {error && <div className="ws-error"><AlertTriangle size={16} /> {error}<button onClick={fetchRaces}>Retry</button></div>}

        {loading ? <LoadingSpinner /> : races.length === 0 ? (
          <div className="ws-panel"><div className="ws-empty"><p className="ws-empty__title">No races found.</p></div></div>
        ) : (
          <div className="ws-panel">
            <div className="ws-table-wrap">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>Race</th><th>Place</th><th>Start</th><th>Prize Pool</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {races.map((race) => {
                    const busy = actionLoading === race.id;
                    return (
                      <tr key={race.id}>
                        <td>
                          <div className="ref-race-name">{race.raceName}</div>
                          <div className="ref-race-track">{race.trackName} · {race.distance}</div>
                        </td>
                        <td>{race.location ?? '—'}</td>
                        <td className="tnum">{formatDate(race.startTime)}</td>
                        <td className="tnum">{formatPrize(race.totalprizepool)}</td>
                        <td><StatusBadge status={race.status} /></td>
                        <td>
                          <div className="ref-actions">
                            {(normalizeStatus(race.status) === 'UPCOMING' || normalizeStatus(race.status) === 'OPEN_REGISTRATION') && (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Wait admin</span>
                            )}
                            {normalizeStatus(race.status) === 'CLOSED_REGISTRATION' && (
                              <button className="ref-btn ref-btn--start" onClick={() => handleStart(race)} disabled={busy}>
                                <Play size={13} /> {busy ? '…' : 'Start'}
                              </button>
                            )}
                            {normalizeStatus(race.status) === 'ONGOING' && (
                              <>
                                <button className="ref-btn ref-btn--result" onClick={() => setSetResultRace(race)} disabled={busy}>
                                  <Trophy size={13} /> Set result
                                </button>
                                <button className="ref-btn ref-btn--finish" onClick={() => handleFinish(race)} disabled={busy}>
                                  <CheckSquare size={13} /> {busy ? '…' : 'Finish'}
                                </button>
                              </>
                            )}
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

      {setResultRace && (
        <SetResultModal race={setResultRace} onClose={() => setSetResultRace(null)} onSuccess={onResultSaved} />
      )}
    </div>
  );
}
