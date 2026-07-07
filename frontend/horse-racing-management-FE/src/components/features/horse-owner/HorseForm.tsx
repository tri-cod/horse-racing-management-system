import { useRef, type ChangeEvent } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { FIELDS, type FieldDef } from '@/hooks/useHorseForm';

interface HorseFormProps {
  form: Record<string, string>;
  errors: Record<string, string | undefined>;
  loading: boolean;
  avatarPreview: string;
  avatarFileName: string;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleAvatarRemove: () => void;
}

const inputCls = (err?: string) =>
  `w-full border ${err ? 'border-fail' : 'border-rim'} bg-surface-input px-3 py-2.5 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors`;

const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4';

/* Section divider */
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-3">{title}</span>
      <div className="flex-1 border-t border-rim" />
    </div>
  );
}

export default function HorseForm({
  form, errors, loading,
  avatarPreview, avatarFileName,
  handleChange, handleBlur,
  handleAvatarChange, handleAvatarRemove,
}: HorseFormProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fieldMap = Object.fromEntries(FIELDS.map((f: FieldDef) => [f.name, f]));

  const renderField = (name: string) => {
    const field = fieldMap[name];
    if (!field) return null;
    const err = errors[name];

    return (
      <div key={name} className="flex flex-col gap-1.5">
        <label className={labelCls} htmlFor={name}>{field.label}</label>
        {field.type === 'select' ? (
          <select
            id={name} name={name} value={form[name]}
            className={inputCls(err)}
            onChange={handleChange} onBlur={handleBlur} disabled={loading}
          >
            {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            id={name} name={name} type={field.type}
            placeholder={field.placeholder}
            className={inputCls(err)}
            value={form[name]} onChange={handleChange} onBlur={handleBlur} disabled={loading}
          />
        )}
        {err && <p className="text-xs text-fail">{err}</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-7">

      {/* Identity */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Identity" />
        {renderField('horseName')}
        {renderField('breed')}
      </div>

      {/* Physical */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Physical" />
        <div className="grid grid-cols-3 gap-4">
          {renderField('age')}
          {renderField('weight')}
          {renderField('gender')}
        </div>
      </div>

      {/* Performance */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Performance" />
        <div className="grid grid-cols-2 gap-4">
          {renderField('speedRating')}
          {renderField('history_rank')}
        </div>
      </div>

      {/* Photo */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Photo" />
        <input
          ref={avatarInputRef}
          id="avatar_url"
          name="avatar_url"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={loading}
        />
        {avatarPreview ? (
          <div className="flex items-center gap-4 border border-rim bg-surface-overlay/50 p-3">
            <img src={avatarPreview} alt="Preview" className="h-16 w-16 object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-2">{avatarFileName}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button" disabled={loading}
                  onClick={() => avatarInputRef.current?.click()}
                  className="flex items-center gap-1.5 border border-rim px-3 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
                >
                  <Upload size={12} /> Change
                </button>
                <button
                  type="button" disabled={loading}
                  onClick={handleAvatarRemove}
                  className="flex items-center gap-1.5 border border-fail/40 px-3 py-1.5 text-xs font-medium text-fail transition-colors hover:bg-fail-subtle"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button" disabled={loading}
            onClick={() => avatarInputRef.current?.click()}
            className="group flex flex-col items-center gap-3 border-2 border-dashed border-rim py-10 transition-colors hover:border-gold/50 hover:bg-gold/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rim bg-surface-overlay transition-colors group-hover:border-gold/30 group-hover:bg-gold/10">
              <ImageIcon size={22} className="text-ink-4 transition-colors group-hover:text-gold/60" />
            </div>
            <div className="text-center">
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors group-hover:text-ink">
                <Upload size={13} /> Click to upload photo
              </p>
              <p className="mt-0.5 text-xs text-ink-4">PNG, JPG, WEBP — up to 2 MB</p>
            </div>
          </button>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Status" />
        <div className="max-w-xs">
          {renderField('status')}
        </div>
      </div>

    </div>
  );
}
