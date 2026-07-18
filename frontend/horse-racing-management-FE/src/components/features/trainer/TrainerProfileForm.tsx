import { useState, type ChangeEvent, type FormEvent } from 'react';
import Button from '@/components/ui/Button';
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
}

interface TrainerProfileFormProps {
  initialValues?: Partial<Trainer>;
  onSubmit: (payload: { dateOfBirth: string; experienceYears: number; description: string; avatarUrl: string | null }) => void;
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
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="divide-y divide-rim">

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
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
