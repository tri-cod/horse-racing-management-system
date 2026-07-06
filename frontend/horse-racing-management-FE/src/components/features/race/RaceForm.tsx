import { useState, useRef, useEffect, type ReactNode, type ChangeEvent } from 'react';
import { Upload, X, ArrowLeft } from 'lucide-react';
import axiosInstance from '@/api/axiosInstance';
import Button from '@/components/ui/Button';
import type { CreateRacePayload, RaceStatus } from '@/types';

const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];
const STEPS = ['Basic Info & Referee', 'Track & Schedule', 'Prize & Capacity', 'Media'];

function toLocalDatetime(iso?: string) {
 if (!iso) return '';
 const d = new Date(iso);
 const p = (n: number) => String(n).padStart(2, '0');
 return`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function toISO(local: string) {
 if (!local) return '';
 return new Date(local).toISOString();
}

interface FormData {
 raceName: string; startTime: string; registrationDeadline: string;
 trackName: string; trackCondition: string; surfaceType: string;
 totalprizepool: string; distance: string; location: string; capacity: string;
 bannerImageurl: string; refereeId: string;
}

type Errors = Partial<Record<keyof FormData | 'submit', string>>;

const EMPTY: FormData = {
 raceName: '', startTime: '', registrationDeadline: '', trackName: '', trackCondition: 'Dry',
 surfaceType: 'Turf', totalprizepool: '', distance: '', location: '', capacity: '', bannerImageurl: '', refereeId: '',
};

function Field({ id, label, required, optional, hint, error, children }: { id: string; label: string; required?: boolean; optional?: boolean; hint?: string; error?: string; children: ReactNode }) {
 return (
 <div className="flex flex-col gap-1">
 <label className="mb-1.5 block text-xs font-medium text-ink-3" htmlFor={id}>
 {label} {required && <span className="text-fail">*</span>}{optional && <span className="text-ink-4"> (optional)</span>}
 </label>
 {children}
 {hint && <p className="text-xs text-ink-4">{hint}</p>}
 {error && <p className="text-xs text-fail">{error}</p>}
 </div>
 );
}

const inputCls = (_err?: string) =>
 'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors';

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`tnum flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${active ? 'bg-gold text-on-gold' : done ? 'bg-ok text-white' : 'bg-surface-overlay text-ink-4'}`}>
                {done ? '✓' : n}
              </div>
              <span className={`whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider ${active ? 'text-gold' : done ? 'text-ok' : 'text-ink-4'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-px flex-1 transition-colors ${done ? 'bg-ok' : 'bg-rim'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-3">{title}</span>
      <div className="flex-1 border-t border-rim" />
    </div>
  );
}

interface RaceFormProps {
 mode?: 'create' | 'edit';
 initialValues?: Partial<FormData & { status?: RaceStatus }>;
 onSubmit: (payload: CreateRacePayload & { status?: RaceStatus }) => Promise<void>;
 loading?: boolean;
}

export default function RaceForm({ mode = 'create', initialValues = {}, onSubmit, loading }: RaceFormProps) {
 const [form, setForm] = useState<FormData>(() => {
 const base = { ...EMPTY, ...initialValues };
 return { ...base, startTime: toLocalDatetime(base.startTime), registrationDeadline: toLocalDatetime(base.registrationDeadline), totalprizepool: base.totalprizepool ?? '', capacity: base.capacity ?? '', refereeId: base.refereeId ?? '' };
 });
 const [errors, setErrors] = useState<Errors>({});
 const [uploading, setUploading] = useState(false);
 const [step, setStep] = useState(1);
 const [displayedStep, setDisplayedStep] = useState(1);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (step === displayedStep) return;
 const t = setTimeout(() => setDisplayedStep(step), 220);
 return () => clearTimeout(t);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [step]);

 const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 const fd = new FormData();
 fd.append('file', file);
 try {
 setUploading(true);
 const res = await axiosInstance.post('/horse-owner/horses/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
 setField('bannerImageurl', res.data.data);
 } catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string } }; message?: string };
 alert('Upload failed: ' + (e?.response?.data?.message ?? e.message));
 } finally { setUploading(false); }
 };

 const setField = (field: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
 const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 setForm((prev) => {
 const next = { ...prev, [field]: e.target.value };
 if (field === 'startTime' && e.target.value && !prev.registrationDeadline) next.registrationDeadline = e.target.value;
 return next;
 });
 };

 const inp = (id: string, field: keyof FormData, type = 'text', extra: Record<string, unknown> = {}) => (
 <input id={id} type={type} className={inputCls(errors[field])} value={form[field]} onChange={set(field)} {...extra} />
 );

 const validateStep = (s: number): Errors => {
 const errs: Errors = {};
 if (s === 1) {
 if (!form.raceName.trim()) errs.raceName = 'Race name is required.';
 if (!form.location.trim()) errs.location = 'Location is required.';
 if (form.refereeId !== '' && isNaN(Number(form.refereeId))) errs.refereeId = 'Referee ID must be a number.';
 }
 if (s === 2) {
 if (!form.startTime) errs.startTime = 'Start time is required.';
 if (!form.trackName.trim()) errs.trackName = 'Track name is required.';
 if (!form.distance.trim()) errs.distance = 'Distance is required.';
 }
 if (s === 3) {
 if (!form.totalprizepool || isNaN(Number(form.totalprizepool)) || Number(form.totalprizepool) < 0) errs.totalprizepool = 'Prize pool must be a positive number.';
 if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1) errs.capacity = 'Capacity must be at least 1.';
 }
 if (s === 4) {
 if (!form.bannerImageurl.trim()) errs.bannerImageurl = 'Banner image is required.';
 }
 return errs;
 };

 const handleNext = () => {
 const errs = validateStep(displayedStep);
 if (Object.keys(errs).length) { setErrors(errs); return; }
 setErrors({}); setStep(displayedStep + 1);
 };

 const handleBack = () => { setErrors({}); setStep(displayedStep - 1); };

 const handleSubmit = async () => {
 const errs = validateStep(4);
 if (Object.keys(errs).length) { setErrors(errs); return; }
 setErrors({});
 const payload: CreateRacePayload & { status?: RaceStatus } = {
 raceName: form.raceName.trim(), startTime: toISO(form.startTime),
 registrationDeadline: form.registrationDeadline ? toISO(form.registrationDeadline) : undefined,
 trackName: form.trackName.trim(), trackCondition: form.trackCondition, surfaceType: form.surfaceType,
 totalprizepool: Number(form.totalprizepool), distance: form.distance.trim(),
 location: form.location.trim(), capacity: Number(form.capacity), bannerImageurl: form.bannerImageurl.trim(),
 status: mode === 'create' ? 'OPEN_REGISTRATION' : (initialValues?.status ?? 'UPCOMING'),
 };
 if (form.refereeId !== '') payload.refereeId = Number(form.refereeId);
 try { await onSubmit(payload); }
 catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string } }; message?: string };
 setErrors({ submit: e?.response?.data?.message ?? e?.message ?? 'Failed to save race.' });
 }
 };

 return (
 <div className="flex flex-col gap-6">
 <StepIndicator current={displayedStep} />

 {errors.submit && <div className=" bg-fail-subtle border border-fail/30 px-4 py-3 text-sm text-fail" role="alert">{errors.submit}</div>}

 <div className=" border border-rim bg-surface-raised p-6">
 {displayedStep === 1 && (
 <section className="flex flex-col gap-5">
 <SectionHeader title="Basic Info & Referee" />
 <div className="flex flex-col gap-4">
 <Field id="rf-name" label="Race Name" required error={errors.raceName}>{inp('rf-name', 'raceName', 'text', { placeholder: 'e.g. Grand Prix 2026' })}</Field>
 <Field id="rf-location" label="Location" required error={errors.location}>{inp('rf-location', 'location', 'text', { placeholder: 'e.g. Hanoi Racetrack' })}</Field>
 <Field id="rf-referee" label="Race Referee ID" optional error={errors.refereeId}
 hint="Optional. Leave blank to assign later.">{inp('rf-referee', 'refereeId', 'number', { placeholder: 'Leave empty if not assigned yet' })}</Field>
 </div>
 </section>
 )}
 {displayedStep === 2 && (
 <section className="flex flex-col gap-5">
 <SectionHeader title="Track & Schedule" />
 <div className="flex flex-col gap-4">
 <Field id="rf-start" label="Start Time" required error={errors.startTime}>{inp('rf-start', 'startTime', 'datetime-local')}</Field>
 <Field id="rf-deadline" label="Registration Deadline" error={errors.registrationDeadline} hint="Auto-close 1 day before start if blank.">{inp('rf-deadline', 'registrationDeadline', 'datetime-local')}</Field>
 <Field id="rf-track" label="Track Name" required error={errors.trackName}>{inp('rf-track', 'trackName', 'text', { placeholder: 'e.g. Main Track' })}</Field>
 <Field id="rf-distance" label="Distance" required error={errors.distance}>{inp('rf-distance', 'distance', 'text', { placeholder: 'e.g. 1600m' })}</Field>
 <Field id="rf-cond" label="Track Condition" required error={errors.trackCondition}>
 <select id="rf-cond" className={inputCls()} value={form.trackCondition} onChange={set('trackCondition')}>
 {TRACK_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
 </select>
 </Field>
 <Field id="rf-surface" label="Surface Type" required error={errors.surfaceType}>
 <select id="rf-surface" className={inputCls()} value={form.surfaceType} onChange={set('surfaceType')}>
 {SURFACE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 </Field>
 </div>
 </section>
 )}
 {displayedStep === 3 && (
 <section className="flex flex-col gap-5">
 <SectionHeader title="Prize & Capacity" />
 <div className="flex flex-col gap-4">
 <Field id="rf-prize" label="Prize Pool (VND)" required error={errors.totalprizepool}>{inp('rf-prize', 'totalprizepool', 'number', { placeholder: 'e.g. 500000000', min: 0 })}</Field>
 <Field id="rf-capacity" label="Capacity (horses)" required error={errors.capacity}>{inp('rf-capacity', 'capacity', 'number', { placeholder: 'e.g. 12', min: 1 })}</Field>
 </div>
 </section>
 )}
 {displayedStep === 4 && (
 <section className="flex flex-col gap-5">
 <SectionHeader title="Media" />
 <Field id="rf-banner" label="Banner Image" required error={errors.bannerImageurl}>
 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
 {!form.bannerImageurl ? (
 <div className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-rim py-12 hover:border-rim-hi transition-colors"
 onClick={() => fileInputRef.current?.click()}
 onDragOver={(e) => e.preventDefault()}
 onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload({ target: { files: [f] } } as unknown as ChangeEvent<HTMLInputElement>); }}>
 {uploading ? <div className="h-8 w-8 animate-spin rounded-full border-2 border-rim border-t-gold" />
 : <><Upload size={22} className="text-ink-4" /><p className="text-sm text-ink-3">Click to upload <span className="text-gold">or drag & drop</span></p><p className="text-xs text-ink-4">JPG, PNG, WEBP — max 10MB</p></>}
 </div>
 ) : (
 <div className=" border border-rim bg-surface-overlay p-3">
 <img src={form.bannerImageurl} alt="Banner preview" className="mb-3 h-40 w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
 <div className="flex gap-2">
 <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()}
 className="flex items-center gap-1.5 border border-rim px-3 py-1.5 text-xs text-ink-3 hover:border-rim-hi hover:text-ink transition-colors">
 <Upload size={13} /> {uploading ? 'Uploading…' : 'Change'}
 </button>
 <button type="button" onClick={() => setField('bannerImageurl', '')}
 className="flex items-center gap-1.5 border border-fail/40 px-3 py-1.5 text-xs text-fail hover:bg-fail-subtle transition-colors">
 <X size={13} /> Remove
 </button>
 </div>
 </div>
 )}
 </Field>
 </section>
 )}
 </div>

 <div className="flex items-center justify-between">
 {displayedStep > 1 ? (
 <button type="button" onClick={handleBack}
 className="flex items-center gap-2 border border-rim px-4 py-2 text-sm text-ink-3 hover:border-rim-hi hover:text-ink transition-colors">
 <ArrowLeft size={15} /> Back
 </button>
 ) : <span />}
 {displayedStep < STEPS.length ? (
 <Button type="button" variant="primary" size="lg" onClick={handleNext}>Next Step</Button>
 ) : (
 <Button type="button" variant="primary" size="lg" disabled={loading} onClick={handleSubmit}>
 {loading ? 'Saving…' : mode === 'create' ? 'Create Race' : 'Save Changes'}
 </Button>
 )}
 </div>
 </div>
 );
}
