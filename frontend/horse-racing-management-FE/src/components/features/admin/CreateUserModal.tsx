import { useState, type ChangeEvent } from 'react';
import { UserPlus } from 'lucide-react';
import { createUserAccount } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import RoleBadge from './RoleBadge';
import type { UserRole } from '@/types';

/* ── Create User Modal ──────────────────────────────────────────
   Admin-only form for POST /admin/create — lets the admin provision
   accounts for privileged roles (STAFF, REFEREE…) without the public
   register + email-OTP flow. Client-side rules mirror the backend
   RegisterRequest validation so errors surface before the request. */

const ROLES: UserRole[] = ['STAFF', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'USER', 'ADMIN'];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin', STAFF: 'Staff', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
  TRAINER: 'Trainer', JOCKEY: 'Jockey', USER: 'Member',
};

interface FormData {
  role: UserRole;
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
}

const EMPTY_FORM: FormData = { role: 'STAFF', fullName: '', username: '', email: '', password: '', phone: '' };

const inputCls = (err?: string) =>
  `w-full border bg-surface-input px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-4 ${
    err ? 'border-fail focus:border-fail' : 'border-rim focus:border-rim-hi'
  }`;

interface Props {
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function CreateUserModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  /* Mirrors backend RegisterRequest: fullName 2-150 no special chars,
     username 3-15, valid email, password ≥8 + uppercase + special char,
     phone optional 10-11 digits. */
  const validate = () => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    const name = form.fullName.trim();
    if (name.length < 2 || name.length > 150) errs.fullName = 'Full name must be 2-150 characters.';
    else if (!/^[\p{L}\p{N}\s]+$/u.test(name)) errs.fullName = 'Full name must not contain special characters.';
    if (form.username.length < 3 || form.username.length > 15) errs.username = 'Username must be 3-15 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password)) errs.password = 'Password needs at least one uppercase letter.';
    else if (!/[^a-zA-Z0-9]/.test(form.password)) errs.password = 'Password needs at least one special character.';
    if (form.phone && !/^[0-9]{10,11}$/.test(form.phone)) errs.phone = 'Phone number must be 10-11 digits.';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      await createUserAccount({
        role: form.role,
        fullName: form.fullName.trim(),
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      onSuccess(`${ROLE_LABELS[form.role]} account "${form.username}" created.`);
      onClose();
    } catch (e: unknown) {
      setApiError(getErrorMessage(e, 'Failed to create the account.'));
    } finally { setLoading(false); }
  };

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Account</p>
      <h3 className="font-serif text-base font-bold text-ink">Create New Account</h3>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="border border-rim-hi px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
      >
        <UserPlus size={14} /> {loading ? 'Creating…' : 'Create Account'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="lg" footer={footer}>
      <div className="space-y-4">
        {/* Role */}
        <div>
          <label htmlFor="cu-role" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
            Role <span className="text-fail">*</span>
          </label>
          <div className="flex items-center gap-3">
            <select id="cu-role" value={form.role} onChange={set('role')} className={inputCls()}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
            <RoleBadge role={form.role} />
          </div>
        </div>

        {/* Full name */}
        <div>
          <label htmlFor="cu-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
            Full Name <span className="text-fail">*</span>
          </label>
          <input id="cu-name" type="text" className={inputCls(errors.fullName)} value={form.fullName}
            onChange={set('fullName')} placeholder="e.g. Nguyen Van A" maxLength={150} />
          {errors.fullName && <p className="mt-1 text-xs text-fail">{errors.fullName}</p>}
        </div>

        {/* Username + Phone */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="cu-username" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
              Username <span className="text-fail">*</span>
            </label>
            <input id="cu-username" type="text" className={inputCls(errors.username)} value={form.username}
              onChange={set('username')} placeholder="3-15 characters" maxLength={15} autoComplete="off" />
            {errors.username && <p className="mt-1 text-xs text-fail">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="cu-phone" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
              Phone
            </label>
            <input id="cu-phone" type="tel" className={inputCls(errors.phone)} value={form.phone}
              onChange={set('phone')} placeholder="Optional, 10-11 digits" maxLength={11} />
            {errors.phone && <p className="mt-1 text-xs text-fail">{errors.phone}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="cu-email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
            Email <span className="text-fail">*</span>
          </label>
          <input id="cu-email" type="email" className={inputCls(errors.email)} value={form.email}
            onChange={set('email')} placeholder="name@example.com" autoComplete="off" />
          {errors.email && <p className="mt-1 text-xs text-fail">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="cu-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-4">
            Password <span className="text-fail">*</span>
          </label>
          <input id="cu-password" type="password" className={inputCls(errors.password)} value={form.password}
            onChange={set('password')} placeholder="Min 8 chars, 1 uppercase, 1 special" autoComplete="new-password" />
          {errors.password && <p className="mt-1 text-xs text-fail">{errors.password}</p>}
        </div>

        {apiError && (
          <p className="border border-fail/20 bg-fail-subtle px-3 py-2 text-sm text-fail">{apiError}</p>
        )}
      </div>
    </Modal>
  );
}
