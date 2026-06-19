import { useContext, useEffect, useState, useCallback } from 'react';
import { Play, CheckSquare, Trophy, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SetResultModal from '../components/referee/SetResultModal';
import { getAllRaces, startRace, finishRace } from '../api/refereeApi';
import '../assets/css/RefereeRacesPage.css';

const STATUS_ORDER = { ONGOING: 0, CLOSED_REGISTRATION: 1, OPEN_REGISTRATION: 2, UPCOMING: 3, FINISHED: 4, CANCELLED: 5 };

function normalizeStatus(status) {
  if (!status) return 'UNKNOWN';
  const s = String(status).trim().toUpperCase();
  switch (s) {
    case 'UPCOMING':             return 'UPCOMING';
    case 'OPEN_REGISTRATION':    return 'OPEN_REGISTRATION';
    case 'CLOSED_REGISTRATION':  return 'CLOSED_REGISTRATION';
    case 'ONGOING':              return 'ONGOING';
    case 'FINISHED':             return 'FINISHED';
    case 'COMPLETED':            return 'FINISHED';
    case 'CANCELLED':            return 'CANCELLED';
    case 'CANCEL':               return 'CANCELLED';
    case 'CANCELED':             return 'CANCELLED';
    case 'LIVE':                 return 'ONGOING';
    default:                     return s;
  }
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
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrize(n) {
  if (!n) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }).format(n);
}

export default function RefereeRacesPage() {
  const { user } = useContext(AuthContext);
  const addToast = useToast();

  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [setResultRace, setSetResultRace] = useState(null);

  const fetchRaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRaces({ size: 100 });
      const list = data?.content ?? [];
      const sorted = [...list].sort(
        (a, b) => (STATUS_ORDER[normalizeStatus(a.status)] ?? 9) - (STATUS_ORDER[normalizeStatus(b.status)] ?? 9)
      );
      setRaces(sorted);
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
      addToast(`Race "${race.raceName}" has started!`, 'success');
      fetchRaces();
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to start race.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinish = async (race) => {
    if (!window.confirm(`Finish race "${race.raceName}"? This action cannot be undone.`)) return;
    setActionLoading(race.id);
    try {
      await finishRace(race.id);
      addToast(`Race "${race.raceName}" has finished!`, 'success');
      fetchRaces();
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to finish race.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const onResultSaved = () => {
    setSetResultRace(null);
    addToast('Results saved successfully!', 'success');
    fetchRaces();
  };

  return (
    <div className="ref-page">
<div className="ref-page__content">
        <div className="ref-page__toolbar">
          <span className="ref-page__count">{races.length} race</span>
        </div>

        {error && (
          <div className="ref-alert ref-alert--error">
            <AlertTriangle size={16} /> {error}
            <button onClick={fetchRaces}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : races.length === 0 ? (
          <div className="ref-empty">There are no races.</div>
        ) : (
          <div className="ref-table-wrap">
            <table className="ref-table">
              <thead>
                <tr>
                  <th>Race</th>
                  <th>Place</th>
                  <th>Start</th>
                  <th>Prize Pool</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {races.map((race) => {
                  const busy = actionLoading === race.id;
                  return (
                    <tr key={race.id} className={`ref-row ref-row--${race.status?.toLowerCase()}`}>
                      <td>
                        <div className="ref-race-name">{race.raceName}</div>
                        <div className="ref-race-track">{race.trackName} · {race.distance}</div>
                      </td>
                      <td>{race.location ?? '—'}</td>
                      <td>{formatDate(race.startTime)}</td>
                      <td>{formatPrize(race.totalprizepool)}</td>
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
        )}
      </div>

      {setResultRace && (
        <SetResultModal
          race={setResultRace}
          onClose={() => setSetResultRace(null)}
          onSuccess={onResultSaved}
        />
      )}
    </div>
  );
}