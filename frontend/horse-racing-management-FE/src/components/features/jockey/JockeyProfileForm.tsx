import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { uploadAvatar } from '@/api/authApi';
import { getErrorMessage } from '@/utils/errors';
import type { Jockey } from '@/types';

interface FormData {
  age: string;
  experienceYear: string;
  description: string;
  avatarUrl: string;
}

interface JockeyProfileFormProps {
  initialValues?: Partial<Jockey>;
  onSubmit: (payload: { age: number; experienceYear: number; description: string; avatarUrl: string | null }) => void;
  loading?: boolean;
}

const baseCls = 'w-full rounded border bg-surface-input px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-4';
const inputCls = (err?: string) =>
  `${baseCls} ${err ? 'border-fail focus:border-fail focus:ring-2 focus:ring-fail/10' : 'border-rim focus:border-navy focus:ring-2 focus:ring-navy/10'}`;

export default function JockeyProfileForm({ initialValues = {}, onSubmit, loading }: JockeyProfileFormProps) {
  const [form, setForm] = useState<FormData>({
    age: initialValues.age?.toString() ?? '',
    experienceYear: initialValues.experienceYear?.toString() ?? '',
    description: initialValues.description ?? '',
    avatarUrl: initialValues.avatarUrl ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const initials = (initialValues.name ?? 'J').charAt(0).toUpperCase();

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
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 14 || age > 70) errs.age = 'Age must be between 14 and 70.';
    const exp = Number(form.experienceYear);
    if (form.experienceYear === '' || isNaN(exp) || exp < 0 || exp > 50) errs.experienceYear = 'Experience must be between 0 and 50.';
    if (form.description.length > 1000) errs.description = 'Maximum 1000 characters.';
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({
      age: Number(form.age),
      experienceYear: Number(form.experienceYear),
      description: form.description,
      avatarUrl: form.avatarUrl || null,
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
            id="jf-avatar-file"
          />
          <label
            htmlFor="jf-avatar-file"
            className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-surface-raised bg-gold text-on-gold transition-colors hover:bg-gold-hi"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          </label>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Photo</p>
          <p className="mt-0.5 text-xs text-ink-3">Shown on your public jockey profile.</p>
          {uploadError && <p className="mt-1 text-xs text-fail">{uploadError}</p>}
        </div>
      </div>

      {/* Age */}
      <div className="px-6 py-5">
        <label htmlFor="jf-age" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Age <span className="text-fail">*</span>
        </label>
        <input id="jf-age" type="number" className={inputCls(errors.age)}
          value={form.age} onChange={set('age')} min={14} max={70} placeholder="e.g. 24" />
        {errors.age && <p className="mt-1.5 text-xs text-fail">{errors.age}</p>}
      </div>

      {/* Experience */}
      <div className="px-6 py-5">
        <label htmlFor="jf-exp" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Experience Years <span className="text-fail">*</span>
        </label>
        <input id="jf-exp" type="number" className={inputCls(errors.experienceYear)}
          value={form.experienceYear} onChange={set('experienceYear')} min={0} max={50} placeholder="e.g. 5" />
        {errors.experienceYear && <p className="mt-1.5 text-xs text-fail">{errors.experienceYear}</p>}
      </div>

      {/* Description */}
      <div className="px-6 py-5">
        <label htmlFor="jf-desc" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Description
        </label>
        <textarea id="jf-desc" className={`${inputCls(errors.description)} resize-none`}
          value={form.description} onChange={set('description')} rows={5} maxLength={1000}
          placeholder="Tell horse owners about your riding style and achievements…" />
        <div className="mt-1.5 text-right text-[11px] text-ink-4">{form.description.length} / 1000</div>
        {errors.description && <p className="mt-1 text-xs text-fail">{errors.description}</p>}
      </div>

      {/* Submit */}
      <div className="flex justify-end px-6 py-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </form>
    </>
  );
}
