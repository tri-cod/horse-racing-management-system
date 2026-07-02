import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { uploadTrainerAvatar } from '@/api/trainerApi';
import type { Trainer } from '@/types';

interface FormData {
  age: string;
  experienceYears: string;
  description: string;
  avatarUrl: string;
}

interface TrainerProfileFormProps {
  initialValues?: Partial<Trainer>;
  onSubmit: (payload: { age: number; experienceYears: number; description: string; avatarUrl: string | null }) => void;
  loading?: boolean;
}

const baseCls = 'w-full rounded border bg-surface-input px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-4';
const inputCls = (err?: string) =>
  `${baseCls} ${err ? 'border-fail focus:border-fail focus:ring-2 focus:ring-fail/10' : 'border-rim focus:border-navy focus:ring-2 focus:ring-navy/10'}`;

export default function TrainerProfileForm({ initialValues = {}, onSubmit, loading }: TrainerProfileFormProps) {
  const [form, setForm] = useState<FormData>({
    age: initialValues.age?.toString() ?? '',
    experienceYears: initialValues.experienceYears?.toString() ?? '',
    description: initialValues.description ?? '',
    avatarUrl: initialValues.avatarUrl ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadTrainerAvatar(file);
      setForm(prev => ({ ...prev, avatarUrl: url }));
    } catch {
      setErrors(prev => ({ ...prev, avatarUrl: 'Upload failed. Please try again.' }));
    } finally {
      setUploading(false);
      /* reset input so same file can be re-picked */
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    const age = Number(form.age);
    if (!form.age || isNaN(age) || age < 18 || age > 99) errs.age = 'Age must be between 18 and 99.';
    const exp = Number(form.experienceYears);
    if (form.experienceYears === '' || isNaN(exp) || exp < 0 || exp > 70) errs.experienceYears = 'Experience must be between 0 and 70.';
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
      experienceYears: Number(form.experienceYears),
      description: form.description,
      avatarUrl: form.avatarUrl || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="divide-y divide-rim">

      {/* Avatar picker */}
      <div className="px-6 py-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-4">Profile Photo</p>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-overlay ring-2 ring-rim">
            {uploading ? (
              <Loader2 size={24} className="animate-spin text-ink-3" />
            ) : form.avatarUrl ? (
              <img src={form.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-ink-4">
                {initialValues.name?.charAt(0)?.toUpperCase() ?? 'T'}
              </span>
            )}
          </div>

          {/* Upload button */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileChange}
              id="tf-avatar-file"
            />
            <label htmlFor="tf-avatar-file"
              className="inline-flex cursor-pointer items-center gap-2 rounded border border-rim px-4 py-2 text-xs font-semibold text-ink-2 transition-colors hover:border-navy hover:text-navy">
              <Camera size={14} />
              {uploading ? 'Uploading…' : form.avatarUrl ? 'Change Photo' : 'Choose Photo'}
            </label>
            <p className="mt-1.5 text-[11px] text-ink-4">JPG, PNG or GIF · max 5 MB</p>
            {errors.avatarUrl && <p className="mt-1 text-xs text-fail">{errors.avatarUrl}</p>}
          </div>
        </div>
      </div>

      {/* Age */}
      <div className="px-6 py-5">
        <label htmlFor="tf-age" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
          Age <span className="text-fail">*</span>
        </label>
        <input id="tf-age" type="number" className={inputCls(errors.age)}
          value={form.age} onChange={set('age')} min={18} max={99} placeholder="e.g. 32" />
        {errors.age && <p className="mt-1.5 text-xs text-fail">{errors.age}</p>}
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
  );
}
