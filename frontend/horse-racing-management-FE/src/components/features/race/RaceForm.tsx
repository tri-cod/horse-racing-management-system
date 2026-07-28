import { useState, useRef, type ReactNode, type ChangeEvent } from 'react';
import { Upload, X, Flag, CalendarClock, ShieldCheck, Trophy, ImageIcon, MapPin, Landmark, type LucideIcon } from 'lucide-react';
import { uploadImage } from '@/api/fileApi';
import { useReferees } from '@/hooks/useReferees';
import Button from '@/components/ui/Button';
import { formatPreferredDistance } from '@/utils/horsePreferences';
import type { CreateRacePayload, RaceStatus, RaceClass, GenderRestriction } from '@/types';

// Mirrors backend DistanceCategory (common/constant/DistanceCategory.java) — kept in
// sync manually since the category itself is derived server-side, not sent by the form.
const MIN_DISTANCE_M = 800;
const MAX_DISTANCE_M = 5000;
function distanceCategory(meters: number): string | null {
 if (meters <= 1400) return 'SPRINT';
 if (meters <= 1800) return 'MILE';
 if (meters <= 2400) return 'MIDDLE';
 return 'LONG';
}

const TRACK_CONDITIONS = ['Dry', 'Wet', 'Muddy', 'Fast', 'Soft'];
const SURFACE_TYPES = ['Turf', 'Dirt', 'Synthetic'];

const RACE_CLASSES: { value: RaceClass | ''; label: string; hint: string }[] = [
 { value: '', label: 'No restriction', hint: '' },
 { value: 'MAIDEN', label: 'Maiden', hint: 'Only horses that have never won a race' },
 { value: 'CLASS_4', label: 'Class 4', hint: 'Career earnings up to 50,000,000₫' },
 { value: 'CLASS_3', label: 'Class 3', hint: 'Career earnings up to 150,000,000₫' },
 { value: 'CLASS_2', label: 'Class 2', hint: 'Career earnings up to 400,000,000₫' },
 { value: 'CLASS_1', label: 'Class 1', hint: 'Career earnings up to 1,000,000,000₫' },
 { value: 'LISTED', label: 'Listed', hint: 'Career earnings at least 200,000,000₫' },
 { value: 'GRADE_1', label: 'Grade 1', hint: 'Career earnings at least 500,000,000₫' },
];

const GENDER_RESTRICTIONS: { value: GenderRestriction | ''; label: string }[] = [
 { value: '', label: 'Any gender' },
 { value: 'MALE', label: 'Male only' },
 { value: 'FEMALE', label: 'Female only' },
 { value: 'GELDING', label: 'Gelding only' },
];

// Every race runs at the same physical venue — locked so it can't drift per-race.
const LOCKED_TRACK_NAME = 'Derby Track';
const LOCKED_LOCATION = 'Santa Anita Park';

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
 raceName: string; startTime: string; registrationOpenDate: string; registrationDeadline: string;
 trackName: string; trackCondition: string; surfaceType: string;
 totalprizepool: string; distanceMeters: string; location: string; capacity: string;
 bannerImageurl: string; refereeId: string; entryFee: string;
 minAge: string; maxAge: string; genderRestriction: string; raceClass: string;
 minEarnings: string; maxEarnings: string; minWeight: string;
}

type Errors = Partial<Record<keyof FormData | 'submit', string>>;

const EMPTY: FormData = {
 raceName: '', startTime: '', registrationOpenDate: '', registrationDeadline: '', trackName: LOCKED_TRACK_NAME, trackCondition: 'Dry',
 surfaceType: 'Turf', totalprizepool: '', distanceMeters: '', location: LOCKED_LOCATION, capacity: '', bannerImageurl: '', refereeId: '', entryFee: '',
 minAge: '', maxAge: '', genderRestriction: '', raceClass: '', minEarnings: '', maxEarnings: '', minWeight: '',
};

function Field({ id, label, required, optional, hint, error, children }: { id: string; label: string; required?: boolean; optional?: boolean; hint?: string; error?: string; children: ReactNode }) {
 return (
 <div className="flex flex-col gap-1.5">
 <label className="block text-sm font-medium text-ink-2" htmlFor={id}>
 {label} {required && <span className="text-fail">*</span>}{optional && <span className="text-ink-4"> (optional)</span>}
 </label>
 {children}
 {hint && <p className="text-xs text-ink-4">{hint}</p>}
 {error && <p className="text-xs text-fail">{error}</p>}
 </div>
 );
}

const inputCls = (_err?: string) =>
 'w-full border border-rim bg-surface-input px-3.5 py-3 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors';

// A fixed, non-editable fact (venue name) shown as a plain readout instead of a
// disabled input — a greyed-out input reads as "empty/unfilled" to a first-time
// user, which is exactly wrong for a value that's already locked in.
function LockedField({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
 return (
 <div className="flex items-center gap-2.5 border border-rim bg-surface-overlay px-3.5 py-3 text-sm">
 <Icon size={16} className="shrink-0 text-gold" />
 <span className="font-medium text-ink-2">{value}</span>
 <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-ink-4">Fixed venue</span>
 </div>
 );
}

// Each part of the form reads as its own card — icon badge + title up top,
// an optional one-line description, then the fields. Easier to scan at a
// glance than a thin divider line, and closer to what a non-dev expects
// from a "create listing" style form.
function SectionCard({ icon: Icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children: ReactNode }) {
 return (
 <section className="rounded-lg border border-rim bg-surface-overlay/40 p-7">
 <div className="mb-5 flex items-start gap-3.5">
 <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
 <Icon size={19} />
 </span>
 <div className="flex flex-col gap-1 pt-1">
 <h3 className="font-serif text-base font-bold leading-none text-ink">{title}</h3>
 {description && <p className="text-xs text-ink-4">{description}</p>}
 </div>
 </div>
 <div className="flex flex-col gap-5">{children}</div>
 </section>
 );
}

interface RaceFormProps {
 mode?: 'create' | 'edit';
 initialValues?: Partial<FormData & { status?: RaceStatus }>;
 onSubmit: (payload: CreateRacePayload & { status?: RaceStatus }) => Promise<void>;
 loading?: boolean;
}

export default function RaceForm({ mode = 'create', initialValues = {}, onSubmit, loading }: RaceFormProps) {
 const { referees, loading: refereesLoading, error: refereesError } = useReferees();
 const [form, setForm] = useState<FormData>(() => {
 // Locked regardless of what an existing race was saved with — track/location are fixed venue info now.
 const base = { ...EMPTY, ...initialValues, trackName: LOCKED_TRACK_NAME, location: LOCKED_LOCATION };
 return {
 ...base,
 startTime: toLocalDatetime(base.startTime),
 registrationOpenDate: toLocalDatetime(base.registrationOpenDate),
 registrationDeadline: toLocalDatetime(base.registrationDeadline),
 totalprizepool: base.totalprizepool ?? '', capacity: base.capacity ?? '', refereeId: base.refereeId ?? '', entryFee: base.entryFee ?? '',
 };
 });
 const [errors, setErrors] = useState<Errors>({});
 const [uploading, setUploading] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 try {
 setUploading(true);
 const url = await uploadImage(file);
 setField('bannerImageurl', url);
 setErrors((prev) => ({ ...prev, bannerImageurl: undefined }));
 } catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string } }; message?: string };
 setErrors((prev) => ({ ...prev, bannerImageurl: 'Upload failed: ' + (e?.response?.data?.message ?? e.message) }));
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

 // Money fields (VND) — shown with thousand separators for readability (e.g. "5.000.000")
 // while the underlying form state still stores plain digits, so parsing on submit is unchanged.
 const formatMoney = (raw: string) => {
 if (raw === '') return '';
 const n = Number(raw);
 return isNaN(n) ? raw : n.toLocaleString('vi-VN');
 };

 const moneyInp = (id: string, field: keyof FormData, placeholder?: string) => (
 <div className="relative">
 <input
 id={id}
 type="text"
 inputMode="numeric"
 className={`${inputCls(errors[field])} pr-8`}
 value={formatMoney(form[field])}
 onChange={(e) => setField(field, e.target.value.replace(/\D/g, ''))}
 placeholder={placeholder}
 />
 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-4">₫</span>
 </div>
 );

 // Every field validated together — nothing is hidden behind a step anymore,
 // so the user sees all problems in one pass instead of discovering them page by page.
 const validateAll = (): Errors => {
 const errs: Errors = {};
 if (!form.raceName.trim()) errs.raceName = 'Race name is required.';
 if (!form.startTime) errs.startTime = 'Start time is required.';
 if (form.registrationOpenDate && form.startTime && form.registrationOpenDate >= form.startTime) {
 errs.registrationOpenDate = 'Registration open date must be before start time.';
 }
 if (form.registrationOpenDate && form.registrationDeadline && form.registrationOpenDate >= form.registrationDeadline) {
 errs.registrationOpenDate = 'Registration open date must be before registration deadline.';
 }
 // Backend requires this (CreateRaceRequest.distanceMeters: @NotNull, 800-5000) — the
 // free-text "Distance" field this used to be paired with no longer exists server-side.
 if (form.distanceMeters === '' || isNaN(Number(form.distanceMeters))) {
 errs.distanceMeters = 'Distance is required.';
 } else if (Number(form.distanceMeters) < MIN_DISTANCE_M || Number(form.distanceMeters) > MAX_DISTANCE_M) {
 errs.distanceMeters = `Distance must be between ${MIN_DISTANCE_M} and ${MAX_DISTANCE_M} meters.`;
 }
 if (form.minAge !== '' && (isNaN(Number(form.minAge)) || Number(form.minAge) < 0)) errs.minAge = 'Minimum age must be a positive number.';
 if (form.maxAge !== '' && (isNaN(Number(form.maxAge)) || Number(form.maxAge) < 0)) errs.maxAge = 'Maximum age must be a positive number.';
 if (form.minAge !== '' && form.maxAge !== '' && Number(form.minAge) > Number(form.maxAge)) errs.maxAge = 'Maximum age must be greater than or equal to minimum age.';
 if (form.minWeight !== '' && (isNaN(Number(form.minWeight)) || Number(form.minWeight) < 0)) errs.minWeight = 'Minimum weight must be a positive number.';
 if (form.minEarnings !== '' && (isNaN(Number(form.minEarnings)) || Number(form.minEarnings) < 0)) errs.minEarnings = 'Minimum earnings must be a positive number.';
 if (form.maxEarnings !== '' && (isNaN(Number(form.maxEarnings)) || Number(form.maxEarnings) < 0)) errs.maxEarnings = 'Maximum earnings must be a positive number.';
 if (form.minEarnings !== '' && form.maxEarnings !== '' && Number(form.minEarnings) > Number(form.maxEarnings)) errs.maxEarnings = 'Maximum earnings must be greater than or equal to minimum earnings.';
 if (!form.totalprizepool || isNaN(Number(form.totalprizepool)) || Number(form.totalprizepool) < 0) errs.totalprizepool = 'Prize pool must be a positive number.';
 if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 1) errs.capacity = 'Capacity must be at least 1.';
 if (form.entryFee !== '' && (isNaN(Number(form.entryFee)) || Number(form.entryFee) < 0)) errs.entryFee = 'Entry fee must be a positive number.';
 if (!form.bannerImageurl.trim()) errs.bannerImageurl = 'Banner image is required.';
 return errs;
 };

 const handleSubmit = async () => {
 const errs = validateAll();
 if (Object.keys(errs).length) { setErrors(errs); return; }
 setErrors({});
 const payload: CreateRacePayload & { status?: RaceStatus } = {
 raceName: form.raceName.trim(), startTime: toISO(form.startTime),
 registrationOpenDate: form.registrationOpenDate ? toISO(form.registrationOpenDate) : undefined,
 registrationDeadline: form.registrationDeadline ? toISO(form.registrationDeadline) : undefined,
 trackName: LOCKED_TRACK_NAME, trackCondition: form.trackCondition, surfaceType: form.surfaceType,
 totalprizepool: Number(form.totalprizepool),
 // distanceMeters is the only distance value the backend reads now — it derives the
 // display string and distance category (Sprint/Mile/Middle/Long) from this.
 distanceMeters: Number(form.distanceMeters),
 location: LOCKED_LOCATION, capacity: Number(form.capacity), bannerImageurl: form.bannerImageurl.trim(),
 status: mode === 'create' ? 'OPEN_REGISTRATION' : (initialValues?.status ?? 'UPCOMING'),
 };
 if (form.refereeId !== '') payload.refereeId = Number(form.refereeId);
 if (mode === 'create' && form.entryFee !== '') payload.entryFee = Number(form.entryFee);
 if (form.minAge !== '') payload.minAge = Number(form.minAge);
 if (form.maxAge !== '') payload.maxAge = Number(form.maxAge);
 if (form.genderRestriction !== '') payload.genderRestriction = form.genderRestriction as CreateRacePayload['genderRestriction'];
 if (form.raceClass !== '') payload.raceClass = form.raceClass as CreateRacePayload['raceClass'];
 if (form.minEarnings !== '') payload.minEarnings = Number(form.minEarnings);
 if (form.maxEarnings !== '') payload.maxEarnings = Number(form.maxEarnings);
 if (form.minWeight !== '') payload.minWeight = Number(form.minWeight);
 try { await onSubmit(payload); }
 catch (err: unknown) {
 const e = err as { response?: { data?: { message?: string; data?: Record<string, string> } }; message?: string };
 // Field-level validation failures (e.g. "raceName: must not contain special characters")
 // come back in response.data.data — surface them instead of the generic top-level message.
 const fieldErrors = e?.response?.data?.data;
 const detail = fieldErrors && typeof fieldErrors === 'object' && Object.keys(fieldErrors).length
 ? Object.entries(fieldErrors).map(([field, msg]) => `${field}: ${msg}`).join(' · ')
 : undefined;
 setErrors({ submit: detail ?? e?.response?.data?.message ?? e?.message ?? 'Failed to save race.' });
 }
 };

 return (
 <div className="flex flex-col gap-6">
 {errors.submit && <div className="rounded border border-fail/30 bg-fail-subtle px-4 py-3 text-sm text-fail" role="alert">{errors.submit}</div>}

 <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-9">

 <div className="flex flex-col gap-7">
 <SectionCard icon={Flag} title="Basic Info & Referee">
 <Field id="rf-name" label="Race Name" required error={errors.raceName}>{inp('rf-name', 'raceName', 'text', { placeholder: 'e.g. Grand Prix 2026' })}</Field>
 <Field id="rf-location" label="Location" required><LockedField icon={MapPin} value={LOCKED_LOCATION} /></Field>
 <Field id="rf-referee" label="Race Referee" optional error={errors.refereeId}
 hint={refereesError ?? 'Optional. Leave blank to assign later.'}>
 <select id="rf-referee" className={inputCls()} value={form.refereeId} onChange={set('refereeId')} disabled={refereesLoading}>
 <option value="">{refereesLoading ? 'Loading referees…' : 'Unassigned'}</option>
 {referees.map((r) => (
 <option key={r.id} value={r.id}>{r.name}</option>
 ))}
 </select>
 </Field>
 </SectionCard>

 <SectionCard icon={CalendarClock} title="Track & Schedule">
 <Field id="rf-start" label="Start Time" required error={errors.startTime}>{inp('rf-start', 'startTime', 'datetime-local')}</Field>
 <Field id="rf-open" label="Registration Opens" optional error={errors.registrationOpenDate} hint="Opens immediately if left blank. Set a future date to keep the race Upcoming until then.">{inp('rf-open', 'registrationOpenDate', 'datetime-local')}</Field>
 <Field id="rf-deadline" label="Registration Deadline" error={errors.registrationDeadline} hint="Auto-close 1 day before start if blank.">{inp('rf-deadline', 'registrationDeadline', 'datetime-local')}</Field>
 <Field id="rf-track" label="Track Name" required><LockedField icon={Landmark} value={LOCKED_TRACK_NAME} /></Field>
 <Field
 id="rf-distance-m" label="Distance (meters)" required error={errors.distanceMeters}
 hint={
 form.distanceMeters !== '' && !isNaN(Number(form.distanceMeters))
 ? `${MIN_DISTANCE_M}–${MAX_DISTANCE_M}m · ${formatPreferredDistance(distanceCategory(Number(form.distanceMeters)))}`
 : `${MIN_DISTANCE_M}–${MAX_DISTANCE_M}m — also determines the race's distance category (Sprint/Mile/Middle/Long).`
 }
 >
 {inp('rf-distance-m', 'distanceMeters', 'number', { placeholder: 'e.g. 1609.5', min: MIN_DISTANCE_M, max: MAX_DISTANCE_M, step: 'any' })}
 </Field>
 <div className="grid grid-cols-2 gap-4">
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
 </SectionCard>
 </div>

 <div className="flex flex-col gap-7">
 <SectionCard icon={ShieldCheck} title="Eligibility Requirements" description="All optional — leave blank for no restriction. A horse that doesn't meet these is blocked from registering.">
 <div className="grid grid-cols-2 gap-4">
 <Field id="rf-min-age" label="Min Age (years)" optional error={errors.minAge}>{inp('rf-min-age', 'minAge', 'number', { placeholder: 'e.g. 3', min: 0 })}</Field>
 <Field id="rf-max-age" label="Max Age (years)" optional error={errors.maxAge}>{inp('rf-max-age', 'maxAge', 'number', { placeholder: 'e.g. 6', min: 0 })}</Field>
 </div>
 <Field id="rf-gender" label="Gender Restriction" optional error={errors.genderRestriction}>
 <select id="rf-gender" className={inputCls()} value={form.genderRestriction} onChange={set('genderRestriction')}>
 {GENDER_RESTRICTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
 </select>
 </Field>
 <Field id="rf-min-weight" label="Min Weight (kg)" optional error={errors.minWeight} hint="Horse must weigh at least this much to register.">
 {inp('rf-min-weight', 'minWeight', 'number', { placeholder: 'e.g. 450', min: 0 })}
 </Field>
 <Field id="rf-class" label="Race Class" optional error={errors.raceClass}
 hint={RACE_CLASSES.find((c) => c.value === form.raceClass)?.hint || 'Determines the default career-earnings range below.'}>
 <select id="rf-class" className={inputCls()} value={form.raceClass} onChange={set('raceClass')}>
 {RACE_CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
 </select>
 </Field>
 <div className="grid grid-cols-2 gap-4">
 <Field id="rf-min-earnings" label="Min Career Earnings (VND)" optional error={errors.minEarnings} hint="Overrides the class default.">
 {moneyInp('rf-min-earnings', 'minEarnings', 'e.g. 0')}
 </Field>
 <Field id="rf-max-earnings" label="Max Career Earnings (VND)" optional error={errors.maxEarnings} hint="Overrides the class default.">
 {moneyInp('rf-max-earnings', 'maxEarnings', 'e.g. 150.000.000')}
 </Field>
 </div>
 </SectionCard>

 <SectionCard icon={Trophy} title="Prize & Capacity">
 <Field id="rf-prize" label="Prize Pool (VND)" required error={errors.totalprizepool}>{moneyInp('rf-prize', 'totalprizepool', 'e.g. 500.000.000')}</Field>
 <Field id="rf-capacity" label="Capacity (horses)" required error={errors.capacity}>{inp('rf-capacity', 'capacity', 'number', { placeholder: 'e.g. 12', min: 1 })}</Field>
 {mode === 'create' && (
 <Field id="rf-entry-fee" label="Entry Fee (VND)" optional error={errors.entryFee} hint="Charged to the horse owner's wallet on registration. Leave blank for a free race.">
 {moneyInp('rf-entry-fee', 'entryFee', 'e.g. 100.000')}
 </Field>
 )}
 </SectionCard>

 <SectionCard icon={ImageIcon} title="Media">
 <Field id="rf-banner" label="Banner Image" required error={errors.bannerImageurl}>
 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
 {!form.bannerImageurl ? (
 <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-rim py-10 hover:border-rim-hi transition-colors"
 onClick={() => fileInputRef.current?.click()}
 onDragOver={(e) => e.preventDefault()}
 onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload({ target: { files: [f] } } as unknown as ChangeEvent<HTMLInputElement>); }}>
 {uploading ? <div className="h-8 w-8 animate-spin rounded-full border-2 border-rim border-t-gold" />
 : <><Upload size={22} className="text-ink-4" /><p className="text-sm text-ink-3">Click to upload <span className="text-gold">or drag & drop</span></p><p className="text-xs text-ink-4">JPG, PNG, WEBP — max 10MB</p></>}
 </div>
 ) : (
 <div className="rounded border border-rim bg-surface-overlay p-3">
 <img src={form.bannerImageurl} alt="Banner preview" className="mb-3 h-40 w-full rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
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
 </SectionCard>
 </div>

 </div>

 <div className="flex justify-end">
 <Button type="button" variant="primary" size="lg" disabled={loading} onClick={handleSubmit}>
 {loading ? 'Saving…' : mode === 'create' ? 'Create Race' : 'Save Changes'}
 </Button>
 </div>
 </div>
 );
}
