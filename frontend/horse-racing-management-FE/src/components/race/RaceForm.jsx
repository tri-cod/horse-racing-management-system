import { useState, useRef, useEffect } from 'react';
import { Upload, X, ArrowLeft } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import Button from '../ui/Button';
import '../../assets/css/race/RaceForm.css';

const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];
const STEPS = ['Basic Info & Referee', 'Track & Schedule', 'Prize & Capacity', 'Media'];

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
  raceName: '', startTime: '', endTime: '', registrationDeadline: '',
  trackName: '', trackCondition: 'Dry', surfaceType: 'Turf',
  totalprizepool: '', distance: '', location: '', capacity: '',
  bannerImageurl: '', refereeId: '',
};

function Field({ id, label, required, optional, hint, error, children }) {
  return (
    <div className="race-form__field">
      <label className="race-form__label" htmlFor={id}>
        {label}{' '}
        {required && <span className="race-form__required">*</span>}
        {optional && <span className="race-form__optional">(optional)</span>}
      </label>
      {children}
      {hint && <span className="race-form__hint">{hint}</span>}
      {error && <span className="race-form__error">{error}</span>}
    </div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="rf-step-indicator">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={n} className="rf-step-indicator__item">
            {i < STEPS.length - 1 && (
              <div className={`rf-step-indicator__line${done ? ' --done' : ''}`} />
            )}
            <div className={`rf-step-indicator__num${active ? ' --active' : done ? ' --done' : ''}`}>
              {done ? '✓' : n}
            </div>
            <span className={`rf-step-indicator__label${active ? ' --active' : ''}`}>{label}</span>
          </div>
        );
      })}
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
      registrationDeadline: toLocalDatetime(base.registrationDeadline),
      totalprizepool: base.totalprizepool ?? '',
      capacity: base.capacity ?? '',
      refereeId: base.refereeId ?? '',
    };
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const [displayedStep, setDisplayedStep] = useState(1);
  const [animClass, setAnimClass] = useState('rf-step--enter-fwd');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (step === displayedStep) return;
    const forward = step > displayedStep;
    setAnimClass(forward ? 'rf-step--exit-fwd' : 'rf-step--exit-back');
    const t = setTimeout(() => {
      setDisplayedStep(step);
      setAnimClass(forward ? 'rf-step--enter-fwd' : 'rf-step--enter-back');
    }, 220);
    return () => clearTimeout(t);
  }, [step]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      const res = await axiosInstance.post('/horse-owner/horses/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setField('bannerImageurl', res.data.data);
    } catch (err) {
      alert('Upload failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'startTime' && value) next.registrationDeadline = value;
      return next;
    });
  };

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

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.raceName.trim()) errs.raceName = 'Race name is required.';
      if (!form.location.trim()) errs.location = 'Location is required.';
      if (form.refereeId !== '' && isNaN(Number(form.refereeId)))
        errs.refereeId = 'Referee ID must be a number.';
    }
    if (s === 2) {
      if (!form.startTime) errs.startTime = 'Start time is required.';
      if (!form.endTime) errs.endTime = 'End time is required.';
      if (form.startTime && form.endTime && new Date(form.startTime) >= new Date(form.endTime))
        errs.endTime = 'End time must be after start time.';
      if (!form.trackName.trim()) errs.trackName = 'Track name is required.';
      if (!form.distance.trim()) errs.distance = 'Distance is required.';
    }
    if (s === 3) {
      if (!form.totalprizepool || isNaN(Number(form.totalprizepool)) || Number(form.totalprizepool) < 0)
        errs.totalprizepool = 'Prize pool must be a positive number.';
      if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1)
        errs.capacity = 'Capacity must be at least 1.';
    }
    if (s === 4) {
      if (!form.bannerImageurl.trim()) errs.bannerImageurl = 'Banner image is required.';
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(displayedStep);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(displayedStep + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep(displayedStep - 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(4);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError(null);

    const payload = {
      raceName: form.raceName.trim(),
      startTime: toISO(form.startTime),
      endTime: toISO(form.endTime),
      registrationDeadline: form.registrationDeadline ? toISO(form.registrationDeadline) : null,
      trackName: form.trackName.trim(),
      trackCondition: form.trackCondition,
      surfaceType: form.surfaceType,
      totalprizepool: Number(form.totalprizepool),
      distance: form.distance.trim(),
      location: form.location.trim(),
      capacity: Number(form.capacity),
      bannerImageurl: form.bannerImageurl.trim(),
      status: mode === 'create' ? 'OPEN_REGISTRATION' : (initialValues?.status ?? 'UPCOMING'),
    };

    if (form.refereeId !== '' && form.refereeId !== null && form.refereeId !== undefined) {
      payload.refereeId = Number(form.refereeId);
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to save race. Please try again.');
    }
  };

  return (
    <div className="race-form">
      <StepIndicator current={displayedStep} />

      {submitError && (
        <div className="race-form__alert" role="alert">{submitError}</div>
      )}

      <div className={`rf-step ${animClass}`}>

        {/* Step 1: Basic Info + Referee */}
        {displayedStep === 1 && (
          <section className="race-form__section">
            <h3 className="race-form__section-title">Basic Info &amp; Referee</h3>
            <div className="race-form__grid-2">
              <Field id="rf-name" label="Race Name" required error={errors.raceName}>
                {inp('rf-name', 'raceName', 'text', { placeholder: 'e.g. Grand Prix 2026' })}
              </Field>
              <Field id="rf-location" label="Location" required error={errors.location}>
                {inp('rf-location', 'location', 'text', { placeholder: 'e.g. Hanoi Racetrack' })}
              </Field>
              <Field id="rf-referee" label="Race Referee ID" optional error={errors.refereeId}
                hint="Optional. Leave blank to assign a referee later via Edit Race.">
                {inp('rf-referee', 'refereeId', 'number', { placeholder: 'Leave empty if not assigned yet' })}
              </Field>
            </div>
          </section>
        )}

        {/* Step 2: Track & Schedule */}
        {displayedStep === 2 && (
          <section className="race-form__section">
            <h3 className="race-form__section-title">Track &amp; Schedule</h3>
            <div className="race-form__grid-2">
              <Field id="rf-start" label="Start Time" required error={errors.startTime}>
                {inp('rf-start', 'startTime', 'datetime-local')}
              </Field>
              <Field id="rf-end" label="End Time" required error={errors.endTime}>
                {inp('rf-end', 'endTime', 'datetime-local')}
              </Field>
              <Field id="rf-reg-deadline" label="Registration Deadline" error={errors.registrationDeadline}
                hint="Leave blank to auto-close 1 day before start time.">
                {inp('rf-reg-deadline', 'registrationDeadline', 'datetime-local')}
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
        )}

        {/* Step 3: Prize & Capacity */}
        {displayedStep === 3 && (
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
        )}

        {/* Step 4: Media */}
        {displayedStep === 4 && (
          <section className="race-form__section">
            <h3 className="race-form__section-title">Media</h3>
            <Field id="rf-banner" label="Banner Image" required error={errors.bannerImageurl}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              {!form.bannerImageurl ? (
                <div
                  className="rf-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('rf-dropzone--drag'); }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('rf-dropzone--drag')}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('rf-dropzone--drag');
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload({ target: { files: [file] } });
                  }}
                  style={{ cursor: uploading ? 'wait' : 'pointer' }}
                >
                  {uploading ? (
                    <div className="rf-dropzone__inner">
                      <div className="rf-spinner" />
                      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Uploading…</span>
                    </div>
                  ) : (
                    <div className="rf-dropzone__inner">
                      <div className="rf-dropzone__icon-wrap">
                        <Upload size={22} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                          Click to upload <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>or drag &amp; drop</span>
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                          JPG, PNG, WEBP — max 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rf-banner-preview">
                  <img
                    src={form.bannerImageurl}
                    alt="Banner preview"
                    className="rf-banner-preview__img"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="rf-banner-preview__overlay">
                    <button type="button" className="rf-banner-preview__btn rf-banner-preview__btn--change"
                      onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      <Upload size={14} /> {uploading ? 'Uploading…' : 'Change'}
                    </button>
                    <button type="button" className="rf-banner-preview__btn rf-banner-preview__btn--remove"
                      onClick={() => setField('bannerImageurl', '')}>
                      <X size={14} /> Remove
                    </button>
                  </div>
                </div>
              )}
            </Field>
          </section>
        )}

      </div>

      <div className="race-form__footer">
        {displayedStep > 1 ? (
          <button type="button" className="rf-btn-back" onClick={handleBack}>
            <ArrowLeft size={16} /> Back
          </button>
        ) : (
          <span />
        )}
        {displayedStep < STEPS.length ? (
          <Button type="button" variant="primary" size="lg" onClick={handleNext}>
            Next Step
          </Button>
        ) : (
          <Button type="button" variant="primary" size="lg" disabled={loading} onClick={handleSubmit}>
            {loading ? 'Saving…' : mode === 'create' ? 'Create Race' : 'Save Changes'}
          </Button>
        )}
      </div>
    </div>
  );
}
