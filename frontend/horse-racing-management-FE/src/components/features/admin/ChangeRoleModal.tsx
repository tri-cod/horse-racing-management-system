import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateUserRole } from '@/api/adminApi';
import RoleBadge from './RoleBadge';
import type { User, UserRole } from '@/types';

const ROLES: UserRole[] = ['ADMIN', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'USER'];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
  TRAINER: 'Trainer', JOCKEY: 'Jockey', USER: 'Member',
};

interface Props {
  user: User | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChangeRoleModal({ user, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<UserRole>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setSelected(user.role); setError(null); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [user, onClose]);

  if (!user) return null;

  const handleConfirm = async () => {
    if (selected === user.role) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      await updateUserRole(user.id, selected);
      onSuccess('Role updated successfully.');
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? 'Failed to update role.');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm border border-rim bg-surface-raised shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rim px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Role</p>
            <h3 className="font-serif text-base font-bold text-ink">Change Role</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-ink-3 transition-colors hover:bg-surface-overlay hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="mb-4 text-sm font-semibold text-ink">{user.fullName}</p>
          <div className="flex flex-col gap-2">
            {ROLES.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                  selected === r ? 'border-gold/40 bg-gold/5' : 'border-rim hover:border-rim-hi'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={selected === r}
                  onChange={() => setSelected(r)}
                  className="accent-gold"
                />
                <span className="flex-1 text-sm text-ink-2">{ROLE_LABELS[r]}</span>
                <RoleBadge role={r} />
              </label>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-fail">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 border-t border-rim px-5 py-4">
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
            onClick={handleConfirm}
            disabled={loading}
            className="bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
