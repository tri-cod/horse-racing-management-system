/**
 * RaceFormModal.jsx — Create & edit race modal
 * Props:
 *   mode        "create" | "edit"
 *   initialData race object (required when mode="edit")
 *   onClose     () => void
 *   onSuccess   () => void  — called after successful save
 */
import { useState, useEffect } from 'react';
import { useRaceForm } from '../../hooks/useRace';
import '../../assets/css/race.css';

const EMPTY_FORM = {
  name:        '',
  location:    '',
  raceDate:    '',
  distance:    '',
  maxHorses:   '',
  prizePool:   '',
  status:      'UPCOMING',
  description: '',
};

/* ISO string → datetime-local input value */
function toDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    const pad = (n) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
  } catch {
    return '';
  }
}

/* ── Component ─────────────────────────────────────────────────────────────── */
export function RaceFormModal({ mode, initialData, onClose, onSuccess }) {
  const [form, setForm]               = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const { loading, error, submit }    = useRaceForm();

  /* Pre-fill form in edit mode */
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        name:        initialData.name        ?? '',
        location:    initialData.location    ?? '',
        raceDate:    toDatetimeLocal(initialData.raceDate),
        distance:    initialData.distance    ?? '',
        maxHorses:   initialData.maxHorses   ?? '',
        prizePool:   initialData.prizePool   ?? '',
        status:      initialData.status      ?? 'UPCOMING',
        description: initialData.description ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFieldErrors({});
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim())                           errors.name      = 'Race name is required.';
    if (!form.location.trim())                       errors.location  = 'Location is required.';
    if (!form.raceDate)                              errors.raceDate  = 'Race date and time are required.';
    if (!form.distance || Number(form.distance) <= 0)
                                                     errors.distance  = 'Distance must be greater than 0.';
    if (!form.maxHorses || Number(form.maxHorses) <= 0)
                                                     errors.maxHorses = 'Max horses must be greater than 0.';
    if (form.prizePool === '' || Number(form.prizePool) < 0)
                                                     errors.prizePool = 'Prize pool must be 0 or more.';
    return errors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = {
      name:        form.name.trim(),
      location:    form.location.trim(),
      raceDate:    new Date(form.raceDate).toISOString(),
      distance:    Number(form.distance),
      maxHorses:   Number(form.maxHorses),
      prizePool:   Number(form.prizePool),
      status:      form.status,
      description: form.description.trim(),
    };

    const ok = await submit(mode, initialData?.id, payload);
    if (ok) onSuccess?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const title = mode === 'create' ? 'Create New Race' : 'Edit Race';

  return (
    <div className="race-modal-backdrop" onClick={handleBackdropClick}>
      <div className="race-modal">

        {/* Header */}
        <div className="race-modal__header">
          <h2 className="race-modal__title">{title}</h2>
          <button className="race-modal__close" onClick={onClose} aria-label="Close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="race-modal__body">
          {error && <div className="race-alert race-alert--error">{error}</div>}

          <form className="race-form" onSubmit={handleSubmit} noValidate>

            {/* Race Name */}
            <div className="race-form__group">
              <label className="race-form__label race-form__label--required">Race Name</label>
              <input
                className={`race-form__input${fieldErrors.name ? ' race-form__input--error' : ''}`}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter race name..."
                maxLength={200}
                autoFocus
              />
              {fieldErrors.name && (
                <span className="race-form__field-error">{fieldErrors.name}</span>
              )}
            </div>

            {/* Location + Date */}
            <div className="race-form__row">
              <div className="race-form__group">
                <label className="race-form__label race-form__label--required">Location</label>
                <input
                  className={`race-form__input${fieldErrors.location ? ' race-form__input--error' : ''}`}
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Racecourse name..."
                />
                {fieldErrors.location && (
                  <span className="race-form__field-error">{fieldErrors.location}</span>
                )}
              </div>
              <div className="race-form__group">
                <label className="race-form__label race-form__label--required">Race Date &amp; Time</label>
                <input
                  type="datetime-local"
                  className={`race-form__input${fieldErrors.raceDate ? ' race-form__input--error' : ''}`}
                  name="raceDate"
                  value={form.raceDate}
                  onChange={handleChange}
                />
                {fieldErrors.raceDate && (
                  <span className="race-form__field-error">{fieldErrors.raceDate}</span>
                )}
              </div>
            </div>

            {/* Distance + Max Horses */}
            <div className="race-form__row">
              <div className="race-form__group">
                <label className="race-form__label race-form__label--required">Distance (meters)</label>
                <input
                  type="number"
                  className={`race-form__input${fieldErrors.distance ? ' race-form__input--error' : ''}`}
                  name="distance"
                  value={form.distance}
                  onChange={handleChange}
                  placeholder="e.g. 1200"
                  min="1"
                />
                {fieldErrors.distance && (
                  <span className="race-form__field-error">{fieldErrors.distance}</span>
                )}
              </div>
              <div className="race-form__group">
                <label className="race-form__label race-form__label--required">Max Horses</label>
                <input
                  type="number"
                  className={`race-form__input${fieldErrors.maxHorses ? ' race-form__input--error' : ''}`}
                  name="maxHorses"
                  value={form.maxHorses}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  min="1"
                  max="30"
                />
                {fieldErrors.maxHorses && (
                  <span className="race-form__field-error">{fieldErrors.maxHorses}</span>
                )}
              </div>
            </div>

            {/* Prize Pool + Status */}
            <div className="race-form__row">
              <div className="race-form__group">
                <label className="race-form__label race-form__label--required">Prize Pool (VND)</label>
                <input
                  type="number"
                  className={`race-form__input${fieldErrors.prizePool ? ' race-form__input--error' : ''}`}
                  name="prizePool"
                  value={form.prizePool}
                  onChange={handleChange}
                  placeholder="e.g. 50000000"
                  min="0"
                />
                {fieldErrors.prizePool && (
                  <span className="race-form__field-error">{fieldErrors.prizePool}</span>
                )}
              </div>
              <div className="race-form__group">
                <label className="race-form__label">Status</label>
                <select
                  className="race-form__select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="race-form__group">
              <label className="race-form__label">Description</label>
              <textarea
                className="race-form__textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional details about this race..."
                maxLength={1000}
              />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="race-modal__footer">
          <button className="race-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="race-btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="race-spinner" />}
            {loading ? 'Saving...' : mode === 'create' ? 'Create Race' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
