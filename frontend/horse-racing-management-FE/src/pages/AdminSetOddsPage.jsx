import { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { getRaces } from '../api/raceApi';
import { getHorsesByRace, setOdds } from '../api/raceHorseApi';
import { assignLanes } from '../utils/laneUtils';
import { useToast } from '../components/ui/ToastProvider';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../assets/css/admin/AdminSetOddsPage.css';

const EDITABLE_STATUSES = ['OPEN_REGISTRATION', 'CLOSED_REGISTRATION', 'UPCOMING'];

export default function AdminSetOddsPage() {
  const addToast = useToast();

  const [races, setRaces]               = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [horses, setHorses]             = useState([]);
  const [oddsMap, setOddsMap]           = useState({});
  const [racesLoading, setRacesLoading] = useState(true);
  const [horsesLoading, setHorsesLoading] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getRaces({ size: 100 });
        const items = data?.content ?? data ?? [];
        setRaces(items.filter((r) => !['FINISHED', 'CANCELLED'].includes(r.status)));
      } catch {
        setError('Unable to load race list.');
      } finally {
        setRacesLoading(false);
      }
    };
    fetch();
  }, []);

  const fetchHorses = useCallback(async (raceId) => {
    if (!raceId) return;
    setHorsesLoading(true);
    setError('');
    try {
      const data = await getHorsesByRace(raceId);
      const approved = assignLanes((data ?? []).filter((h) => h.status?.toLowerCase() === 'approved'));
      setHorses(approved);
      const map = {};
      approved.forEach((h) => {
        const id = h.raceHorseId ?? h.id;
        map[id] = h.odds != null ? String(h.odds) : '';
      });
      setOddsMap(map);
    } catch {
      setError('Unable to load horse list.');
    } finally {
      setHorsesLoading(false);
    }
  }, []);

  const handleRaceChange = (e) => {
    const id = e.target.value;
    setSelectedRaceId(id);
    setHorses([]);
    setOddsMap({});
    setError('');
    if (id) fetchHorses(id);
  };

  const handleOddsChange = (horseId, value) =>
    setOddsMap((prev) => ({ ...prev, [horseId]: value }));

  const handleSaveAll = async () => {
    if (!selectedRaceId || horses.length === 0) return;

    for (const h of horses) {
      const id = h.raceHorseId ?? h.id;
      const val = parseFloat(oddsMap[id]);
      if (isNaN(val) || val <= 0) {
        addToast(`Odds for "${h.horseName}" must be a positive number.`, 'error');
        return;
      }
    }

    setSaving(true);
    try {
      await setOdds({
        raceId: parseInt(selectedRaceId, 10),
        oddsList: horses.map((h) => ({
          raceHorseId: h.raceHorseId ?? h.id,
          odds: parseFloat(oddsMap[h.raceHorseId ?? h.id]),
        })),
      });
      addToast('Odds saved for all horses!', 'success');
      fetchHorses(selectedRaceId);
    } catch (e) {
      addToast(e?.response?.data?.message ?? 'Failed to save odds.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const allFilled = horses.length > 0 && horses.every((h) => {
    const val = parseFloat(oddsMap[h.raceHorseId ?? h.id]);
    return !isNaN(val) && val > 0;
  });

  return (
    <div className="admin-odds-page">
      <div className="admin-odds-page__content">

        <div className="admin-odds-page__header">
          <TrendingUp size={28} className="admin-odds-page__header-icon" />
          <div>
            <h1 className="admin-odds-page__title">Set Odds</h1>
            <p className="admin-odds-page__subtitle">
              Select a race and enter odds for each approved horse
            </p>
          </div>
        </div>

        <div className="admin-odds-select-card">
          <label className="admin-odds-select-label">Race</label>
          {racesLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="admin-odds-select-row">
              <select
                className="admin-odds-select"
                value={selectedRaceId}
                onChange={handleRaceChange}
              >
                <option value="">— Select a race —</option>
                {races.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.raceName}
                    {r.status ? ` · ${r.status}` : ''}
                  </option>
                ))}
              </select>
              {selectedRaceId && (
                <button
                  type="button"
                  className="ui-btn ui-btn--outline ui-btn--sm"
                  onClick={() => fetchHorses(selectedRaceId)}
                  disabled={horsesLoading}
                >
                  <RefreshCw size={14} /> Refresh
                </button>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="admin-odds-error">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {selectedRaceId && (
          horsesLoading ? (
            <LoadingSpinner />
          ) : horses.length === 0 ? (
            <div className="admin-odds-empty">
              No approved horses in this race.
            </div>
          ) : (
            <>
              <div className="admin-odds-table-wrap">
                <table className="admin-odds-table">
                  <thead>
                    <tr>
                      <th>Lane</th>
                      <th>Horse</th>
                      <th>Jockey</th>
                      <th>Current Odds</th>
                      <th>New Odds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horses.map((h) => {
                      const id = h.raceHorseId ?? h.id;
                      return (
                        <tr key={id} className="admin-odds-table__row">
                          <td>
                            <span className="admin-odds-lane">#{h.laneNumber ?? '—'}</span>
                          </td>
                          <td className="admin-odds-horse-name">{h.horseName ?? '—'}</td>
                          <td className="admin-odds-jockey">{h.jockeyName ?? '—'}</td>
                          <td>
                            {h.odds != null ? (
                              <span className="admin-odds-current">x{h.odds}</span>
                            ) : (
                              <span className="admin-odds-unset">Not set</span>
                            )}
                          </td>
                          <td>
                            <div className="admin-odds-input-wrap">
                              <input
                                type="number"
                                className="admin-odds-input"
                                placeholder="2.50"
                                min="1.01"
                                step="0.01"
                                value={oddsMap[id] ?? ''}
                                onChange={(e) => handleOddsChange(id, e.target.value)}
                              />
                              <span className="admin-odds-suffix">x</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="admin-odds-actions">
                <span className="admin-odds-hint">
                  {horses.length} horse{horses.length !== 1 ? 's' : ''} · Enter odds for all then save
                </span>
                <button
                  type="button"
                  className="ui-btn ui-btn--primary ui-btn--md"
                  onClick={handleSaveAll}
                  disabled={saving || !allFilled}
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save All Odds'}
                </button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
