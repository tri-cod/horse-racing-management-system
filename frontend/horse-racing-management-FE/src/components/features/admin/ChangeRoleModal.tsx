import { useState, useEffect } from 'react';
import { updateUserRole } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import RoleBadge from './RoleBadge';
import type { User, UserRole } from '@/types';

const ROLES: UserRole[] = ['ADMIN', 'STAFF', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'USER'];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin', STAFF: 'Staff', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
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

  if (!user) return null;

  const handleConfirm = async () => {
    if (selected === user.role) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      await updateUserRole(user.id, selected);
      onSuccess('Role updated successfully.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to update role.'));
    } finally { setLoading(false); }
  };

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Role</p>
      <h3 className="font-serif text-base font-bold text-ink">Change Role</h3>
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
        onClick={handleConfirm}
        disabled={loading}
        className="bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save Role'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="sm" footer={footer}>
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
    </Modal>
  );
}
