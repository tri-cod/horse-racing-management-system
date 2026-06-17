import { useState } from 'react';
import Button from '../ui/Button';
import '../../assets/css/race/RaceForm.css';

const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];

function toLocalDatetime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISO(local) {
  if (!local) return '';
  return new Date(local).toISOString();
}

const EMPTY = {
  raceName: '',
  startTime: '',
  endTime: '',
  trackName: '',
  trackCondition: 'Dry',
  surfaceType: 'Turf',
  totalprizepool: '',
  distance: '',
  location: '',
  capacity: '',
  bannerImageurl: '',
  refereeId: '',
};

/* Field is defined OUTSIDE RaceForm to prevent remounting on every render (focus-loss bug) */
function Field({ id, label, required, optional, error, children }) {
  return (
    <div className="race-form__field">
      <label className="race-form__label" htmlFor={id}>
        {label}{' '}
        {required && <span className="race-form__required">*</span>}
        {optional && <span className="race-form__optional">(optional)</span>}
      </label>
      {children}
      {error && <span className="race-form__error">{error}</span>}
    </div>
  );
}

export default function RaceForm({ mode = 'create', initialValues = {}, onSubmit, loading }) {
  const [form, setForm] = useState(() => {
    const base = { ...EMPTY, ...initialValues };
    return {
      ...base,
      startTime: toLocalDatetime(base.startTime),
      endTime: toLocalDatetime(base.endTime),
      totalprizepool: base.totalprizepool ?? '',
      capacity: base.capacity ?? '',
      refereeId: base.refereeId ?? '',
    };
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const inp = (id, field, type = 'text', extra = {}) => (
    <input
      id={id}
      type={type}
      className={`race-form__input${errors[field] ? ' race-form__input--error' : ''}`}
      value={form[field]}
      onChange={set(field)}
      {...extra}
    />
  );

  const validate = () => {
    const errs = {};
    if (!form.raceName.trim()) errs.raceName = 'Race name is required.';
    if (!form.startTime) errs.startTime = 'Start time is required.';
    if (!form.endTime) errs.endTime = 'End time is required.';
    if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime))
      errs.endTime = 'End time must be after start time.';
    if (!form.trackName.trim()) errs.trackName = 'Track name is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.distance.trim()) errs.distance = 'Distance is required.';
    if (!form.totalprizepool || isNaN(Number(form.totalprizepool)) || Number(form.totalprizepool) < 0)
      errs.totalprizepool = 'Prize pool must be a positive number.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
      errs.capacity = 'Capacity must be at least 1.';
    if (!form.bannerImageurl.trim()) errs.bannerImageurl = 'Banner image URL is required.';
    // refereeId là OPTIONAL — chỉ validate khi admin có nhập
    if (form.refereeId !== '' && isNaN(Number(form.refereeId)))
      errs.refereeId = 'Referee ID must be a number.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = {
      raceName: form.raceName.trim(),
      startTime: toISO(form.startTime),
      endTime: toISO(form.endTime),
      trackName: form.trackName.trim(),
      trackCondition: form.trackCondition,
      surfaceType: form.surfaceType,
      totalprizepool: Number(form.totalprizepool),
      distance: form.distance.trim(),
      location: form.location.trim(),
      capacity: Number(form.capacity),
      bannerImageurl: form.bannerImageurl.trim(),
      status: mode === 'create' ? 'UPCOMING' : (initialValues?.status ?? 'UPCOMING'),
    };

    // Chỉ gửi refereeId nếu admin có nhập (giá trị khác chuỗi rỗng)
    // Nếu không nhập → không kèm field → backend coi là null → race tạo không cần referee
    if (form.refereeId !== '' && form.refereeId !== null && form.refereeId !== undefined) {
      payload.refereeId = Number(form.refereeId);
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      // Parent (AdminCreateRacePage) thường đã handle toast, nhưng để fallback message inline
      const msg = err?.response?.data?.message || err?.message || 'Failed to save race. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <form className="race-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="race-form__alert" role="alert">
          {submitError}
        </div>
      )}

      <section className="race-form__section">
        <h3 className="race-form__section-title">Basic Info</h3>
        <div className="race-form__grid-2">
          <Field id="rf-name" label="Race Name" required error={errors.raceName}>
            {inp('rf-name', 'raceName', 'text', { placeholder: 'e.g. Grand Prix 2026' })}
          </Field>
          <Field id="rf-location" label="Location" required error={errors.location}>
            {inp('rf-location', 'location', 'text', { placeholder: 'e.g. Hanoi Racetrack' })}
          </Field>
        </div>
      </section>

      <section className="race-form__section">
        <h3 className="race-form__section-title">Track &amp; Schedule</h3>
        <div className="race-form__grid-2">
          <Field id="rf-start" label="Start Time" required error={errors.startTime}>
            {inp('rf-start', 'startTime', 'datetime-local')}
          </Field>
          <Field id="rf-end" label="End Time" required error={errors.endTime}>
            {inp('rf-end', 'endTime', 'datetime-local')}
          </Field>
          <Field id="rf-track" label="Track Name" required error={errors.trackName}>
            {inp('rf-track', 'trackName', 'text', { placeholder: 'e.g. Main Track' })}
          </Field>
          <Field id="rf-distance" label="Distance" required error={errors.distance}>
            {inp('rf-distance', 'distance', 'text', { placeholder: 'e.g. 1600m' })}
          </Field>
          <Field id="rf-condition" label="Track Condition" required error={errors.trackCondition}>
            <select id="rf-condition" className="race-form__input" value={form.trackCondition} onChange={set('trackCondition')}>
              {TRACK_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field id="rf-surface" label="Surface Type" required error={errors.surfaceType}>
            <select id="rf-surface" className="race-form__input" value={form.surfaceType} onChange={set('surfaceType')}>
              {SURFACE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <section className="race-form__section">
        <h3 className="race-form__section-title">Prize &amp; Capacity</h3>
        <div className="race-form__grid-2">
          <Field id="rf-prize" label="Prize Pool (VND)" required error={errors.totalprizepool}>
            {inp('rf-prize', 'totalprizepool', 'number', { placeholder: 'e.g. 500000000', min: 0 })}
          </Field>
          <Field id="rf-capacity" label="Capacity (horses)" required error={errors.capacity}>
            {inp('rf-capacity', 'capacity', 'number', { placeholder: 'e.g. 12', min: 1 })}
          </Field>
        </div>
      </section>

      <section className="race-form__section">
        <h3 className="race-form__section-title">Media</h3>
        <Field id="rf-banner" label="Banner Image URL" required error={errors.bannerImageurl}>
          <div className="race-form__url-row">
            {inp('rf-banner', 'bannerImageurl', 'url', { placeholder: 'https://...' })}
            {form.bannerImageurl && (
              <img
                className="race-form__thumb"
                src={form.bannerImageurl}
                alt="Banner preview"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        </Field>
      </section>

      <section className="race-form__section">
        <h3 className="race-form__section-title">Referee</h3>
        <div className="race-form__grid-2">
          <Field id="rf-referee" label="Race Referee ID" optional error={errors.refereeId}>
            {inp('rf-referee', 'refereeId', 'number', { placeholder: 'Leave empty if not assigned yet' })}
            <span className="race-form__hint">
              Optional. This is the ID from the <code>race_referee</code> profile table
              (not a user ID). Leave blank to create the race without a referee — an admin
              can assign one later through Edit Race.
            </span>
          </Field>
        </div>
      </section>

      <div className="race-form__footer">
        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Create Race' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}