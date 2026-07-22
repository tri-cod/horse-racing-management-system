import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { uploadAvatar } from '@/api/authApi';
import { getErrorMessage } from '@/utils/errors';
import { isoDateYearsAgo } from '@/utils/age';
import type { Trainer } from '@/types';

const MIN_AGE = 18;
const MAX_AGE = 99;
const MIN_DOB = isoDateYearsAgo(MAX_AGE);
const MAX_DOB = isoDateYearsAgo(MIN_AGE);

interface FormData {
  dateOfBirth: string;
  experienceYears: string;
  description: string;
  avatarUrl: string;
  monthlyFee: string;
  specialization: string;
  isAvailable: boolean;
}

interface TrainerProfileFormProps {
  initialValues?: Partial<Trainer>;
  onSubmit: (payload: {
    dateOfBirth: string; experienceYears: number; description: string; avatarUrl: string | null;
    monthlyFee: number | null; specialization: string | null; isAvailable: boolean;
  }) => void;
  loading?: boolean;
}

const baseCls = 'w-full rounded border bg-surface-input px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-4';
const inputCls = (err?: string) =>
  `${baseCls} ${err ? 'border-fail focus:border-fail focus:ring-2 focus:ring-fail/10' : 'border-rim focus:border-navy focus:ring-2 focus:ring-navy/10'}`;

export default function TrainerProfileForm({ initialValues = {}, onSubmit, loading }: TrainerProfileFormProps) {
  const [form, setForm] = useState<FormData>({
    dateOfBirth: initialValues.dateOfBirth ?? '',
    experienceYears: initialValues.experienceYears?.toString() ?? '',
    description: initialValues.description ?? '',
    avatarUrl: initialValues.avatarUrl ?? '',
    monthlyFee: initialValues.monthlyFee != null ? String(initialValues.monthlyFee) : '',
    specialization: initialValues.specialization ?? '',
    isAvailable: initialValues.isAvailable ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = (initialValues.name ?? 'T').charAt(0).toUpperCase();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);
    setUploadError('');
    try {
      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
      const url = await uploadAvatar(croppedFile);
      setForm((prev) => ({ ...prev, avatarUrl: url }));
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, 'Upload failed. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.dateOfBirth || form.dateOfBirth < MIN_DOB || form.dateOfBirth > MAX_DOB) {
      errs.dateOfBirth = `Age must be between ${MIN_AGE} and ${MAX_AGE}.`;
    }
    const exp = Number(form.experienceYears);
    if (form.experienceYears === '' || isNaN(exp) || exp < 0 || exp > 70) errs.experienceYears = 'Experience must be between 0 and 70.';
    if (form.description.length > 1000) errs.description = 'Maximum 1000 characters.';
    if (form.monthlyFee !== '') {
      const fee = Number(form.monthlyFee);
      if (isNaN(fee) || fee < 0) errs.monthlyFee = 'Monthly fee must be a positive number.';
    }
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({
      dateOfBirth: form.dateOfBirth,
      experienceYears: Number(form.experienceYears),
      description: form.description,
      avatarUrl: form.avatarUrl || null,
      monthlyFee: form.monthlyFee === '' ? null : Number(form.monthlyFee),
      specialization: form.specialization.trim() || null,
      isAvailable: form.isAvailable,
    });
  };

  return (
    <>
    {cropSrc && (
      <ImageCropModal
        imageSrc={cropSrc}
        onCancel={() => setCropSrc(null)}
        onConfirm={handleCropConfirm}
      />
    )}
    <form onSubmit={handleSubmit} noValidate className="divide-y divide-rim">

      {/* Avatar */}
      <div className="flex items-center gap-4 px-6 py-5">
        <div className="relative shrink-0">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-rim-hi bg-gold/10">
            {form.avatarUrl ? (
              <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-serif text-xl font-bold text-gold">{initials}</span>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileSelect}
            id="tf-avatar-file"
          />
          <label
            htmlFor="tf-avatar-file"
            className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-surface-raised bg-gold text-on-gold transition-colors hover:bg-gold-hi"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </label>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Photo</p>
          <p className="mt-0.5 text-xs text-ink-3">Shown on your public trainer profile.</p>
          {uploadError && <p className="mt-1 text-xs text-fail">{uploadError}</p>}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="px-6 py-5">
        <label htmlFor="tf-dob" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Date of Birth <span className="text-fail">*</span>
        </label>
        <input id="tf-dob" type="date" className={inputCls(errors.dateOfBirth)}
          value={form.dateOfBirth} onChange={set('dateOfBirth')} min={MIN_DOB} max={MAX_DOB} />
        {errors.dateOfBirth && <p className="mt-1.5 text-xs text-fail">{errors.dateOfBirth}</p>}
      </div>

      {/* Experience */}
      <div className="px-6 py-5">
        <label htmlFor="tf-exp" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Experience Years <span className="text-fail">*</span>
        </label>
        <input id="tf-exp" type="number" className={inputCls(errors.experienceYears)}
          value={form.experienceYears} onChange={set('experienceYears')} min={0} max={70} placeholder="e.g. 10" />
        {errors.experienceYears && <p className="mt-1.5 text-xs text-fail">{errors.experienceYears}</p>}
      </div>

      {/* Monthly Fee — the fixed price owners see and pay per month. */}
      <div className="px-6 py-5">
        <label htmlFor="tf-fee" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Monthly Fee (VND)
        </label>
        <input id="tf-fee" type="number" className={inputCls(errors.monthlyFee)}
          value={form.monthlyFee} onChange={set('monthlyFee')} min={0} placeholder="e.g. 5000000" />
        <p className="mt-1.5 text-xs text-ink-4">Shown to horse owners; charged per month of the contract.</p>
        {errors.monthlyFee && <p className="mt-1 text-xs text-fail">{errors.monthlyFee}</p>}
      </div>

      {/* Specialization — the trainer's strength shown on their card/profile. */}
      <div className="px-6 py-5">
        <label htmlFor="tf-spec" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Specialization
        </label>
        <input id="tf-spec" type="text" className={inputCls()}
          value={form.specialization} onChange={set('specialization')} maxLength={255}
          placeholder="e.g. Sprint, Endurance, Young horses" />
        <p className="mt-1.5 text-xs text-ink-4">Your strengths — what you're best at training.</p>
      </div>

      {/* Availability toggle */}
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Accepting New Horses</p>
          <p className="mt-0.5 text-xs text-ink-4">Turn off if you're at full capacity.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isAvailable}
          onClick={() => setForm((prev) => ({ ...prev, isAvailable: !prev.isAvailable }))}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.isAvailable ? 'bg-ok' : 'bg-rim-hi'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Description */}
      <div className="px-6 py-5">
        <label htmlFor="tf-desc" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Description
        </label>
        <textarea id="tf-desc" className={`${inputCls(errors.description)} resize-none`}
          value={form.description} onChange={set('description')} rows={5} maxLength={1000}
          placeholder="Tell horse owners about your experience and training philosophy…" />
        <div className="mt-1.5 text-right text-[11px] text-ink-4">{form.description.length} / 1000</div>
        {errors.description && <p className="mt-1 text-xs text-fail">{errors.description}</p>}
      </div>

      {/* Submit */}
      <div className="flex justify-end px-6 py-4">
        <Button type="submit" variant="primary" disabled={loading || uploading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </form>
    </>
  );
}
