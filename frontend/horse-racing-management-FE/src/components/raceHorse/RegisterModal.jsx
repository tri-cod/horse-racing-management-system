// Module: Race Horse — Register horse to race modal (HORSE_OWNER only)
import { useState, useEffect } from 'react';
import { useRaceHorseRegister } from '../../hooks/useRaceHorse';
import { getUpcomingRaces, getMyHorseList, getJockeyList } from '../../api/raceHorseApi';
import '../../assets/css/raceHorse.css';
import '../../assets/css/login.css';

// Extract list from wrapped or unwrapped response
function extractList(res) {
  if (!res) return [];
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return raw;
  if (raw?.content) return raw.content;
  return [];
}

function formatRaceDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const EMPTY_FORM = { raceId: '', horseId: '', jockeyId: '' };

export function RegisterModal({ onClose, onSuccess }) {
  /* Dropdown data */
  const [races,   setRaces]   = useState([]);
  const [horses,  setHorses]  = useState([]);
  const [jockeys, setJockeys] = useState([]);
  const [dropLoading, setDropLoading] = useState(true);
  const [dropError,   setDropError]   = useState(null);

  /* Form state */
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});

  const { loading, error, success, submitRegister } = useRaceHorseRegister();

  /* Load all 3 dropdowns in parallel on mount */
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setDropLoading(true);
      setDropError(null);
      try {
        const [rRes, hRes, jRes] = await Promise.all([
          getUpcomingRaces(),
          getMyHorseList(),
          getJockeyList(),
        ]);
        if (cancelled) return;
        setRaces(extractList(rRes));
        setHorses(extractList(hRes));
        setJockeys(extractList(jRes));
      } catch {
        if (!cancelled) setDropError('Failed to load form data. Please try again.');
      } finally {
        if (!cancelled) setDropLoading(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!form.raceId)   errors.raceId   = 'Please select a race.';
    if (!form.horseId)  errors.horseId  = 'Please select a horse.';
    if (!form.jockeyId) errors.jockeyId = 'Please select a jockey.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }

    const ok = await submitRegister({
      raceId:   Number(form.raceId),
      horseId:  Number(form.horseId),
      jockeyId: Number(form.jockeyId),
    });
    if (ok) {
      setTimeout(() => onSuccess?.(), 1200); // let user read success message
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  /* Selected race hint text */
  const selectedRace   = races.find((r) => String(r.id) === String(form.raceId));
  const selectedHorse  = horses.find((h) => String(h.id) === String(form.horseId));
  const selectedJockey = jockeys.find((j) => String(j.id) === String(form.jockeyId));

  return (
    <div className="rh-modal-overlay" onClick={handleBackdropClick}>
      <div className="rh-modal">

        {/* Header */}
        <div className="rh-modal__header">
          <h2 className="rh-modal__title">Register Horse to Race</h2>
          <button className="rh-modal__close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="rh-modal__body">
          {dropError && <div className="login-error">{dropError}</div>}
          {error     && <div className="login-error">{error}</div>}
          {success   && <div className="login-success">{success}</div>}

          {dropLoading ? (
            <div className="rh-form">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rh-card-skeleton__body">
                  <div className="rh-skeleton rh-card-skeleton__line" />
                  <div className="rh-skeleton rh-card-skeleton__line" />
                </div>
              ))}
            </div>
          ) : (
            <form className="rh-form" onSubmit={handleSubmit} noValidate>

              {/* Select Race */}
              <div className="form-group">
                <label className="form-label">
                  Race <span aria-hidden="true" data-required="true">*</span>
                </label>
                <select
                  className={`rh-select rh-select--form${fieldErrors.raceId ? ' rh-select--error' : ''}`}
                  name="raceId"
                  value={form.raceId}
                  onChange={handleChange}
                >
                  <option value="">— Select a race —</option>
                  {races.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {selectedRace && (
                  <span className="rh-option-hint">
                    {selectedRace.location} · {formatRaceDate(selectedRace.raceDate)}
                  </span>
                )}
                {fieldErrors.raceId && (
                  <span className="rh-option-hint" data-error="true">{fieldErrors.raceId}</span>
                )}
              </div>

              {/* Select Horse */}
              <div className="form-group">
                <label className="form-label">
                  My Horse <span aria-hidden="true" data-required="true">*</span>
                </label>
                <select
                  className={`rh-select rh-select--form${fieldErrors.horseId ? ' rh-select--error' : ''}`}
                  name="horseId"
                  value={form.horseId}
                  onChange={handleChange}
                >
                  <option value="">— Select a horse —</option>
                  {horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.horseName}
                    </option>
                  ))}
                </select>
                {selectedHorse && (
                  <span className="rh-option-hint">
                    {selectedHorse.breed} · {selectedHorse.age} yrs · Speed {selectedHorse.speedRating}
                  </span>
                )}
                {fieldErrors.horseId && (
                  <span className="rh-option-hint" data-error="true">{fieldErrors.horseId}</span>
                )}
              </div>

              {/* Select Jockey */}
              <div className="form-group">
                <label className="form-label">
                  Jockey <span aria-hidden="true" data-required="true">*</span>
                </label>
                <select
                  className={`rh-select rh-select--form${fieldErrors.jockeyId ? ' rh-select--error' : ''}`}
                  name="jockeyId"
                  value={form.jockeyId}
                  onChange={handleChange}
                >
                  <option value="">— Select a jockey —</option>
                  {jockeys.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
                {selectedJockey && (
                  <span className="rh-option-hint">
                    {selectedJockey.experienceYear} yrs experience · {selectedJockey.status}
                  </span>
                )}
                {fieldErrors.jockeyId && (
                  <span className="rh-option-hint" data-error="true">{fieldErrors.jockeyId}</span>
                )}
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="rh-modal__footer">
          <button className="rh-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="btn-signin"
            onClick={handleSubmit}
            disabled={loading || dropLoading || !!success}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Submitting...' : 'Register Horse'}
          </button>
        </div>

      </div>
    </div>
  );
}
