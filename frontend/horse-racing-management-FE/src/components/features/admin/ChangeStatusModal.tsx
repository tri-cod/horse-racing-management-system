import { useState, useEffect } from 'react';
import { updateUserStatus } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import StatusBadge from './StatusBadge';
import type { User, UserStatus } from '@/types';

const STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED'];

const STATUS_DESC: Record<UserStatus, string> = {
  ACTIVE: 'User can log in and use the platform normally.',
  INACTIVE: 'User account is disabled but not banned.',
  BANNED: 'User is blocked from accessing the platform.',
};

interface Props {
  user: User | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChangeStatusModal({ user, onClose, onSuccess }: Props) {
  const [selected, setSelected] = useState<UserStatus>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setSelected(user.status); setError(null); }
  }, [user]);

  if (!user) return null;

  const handleConfirm = async () => {
    if (selected === user.status) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      await updateUserStatus(user.id, selected);
      onSuccess('Status updated successfully.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to update status.'));
    } finally { setLoading(false); }
  };

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Status</p>
      <h3 className="font-serif text-base font-bold text-ink">Change Status</h3>
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
        className={`px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
          selected === 'BANNED'
            ? 'bg-fail text-white hover:bg-fail/80'
            : 'bg-navy text-on-blue hover:bg-navy-hi'
        }`}
      >
        {loading ? 'Saving…' : 'Save Status'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="sm" footer={footer}>
      <p className="mb-4 text-sm font-semibold text-ink">{user.fullName}</p>
      <div className="flex flex-col gap-2">
        {STATUSES.map((s) => (
          <label
            key={s}
            className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
              selected === s ? 'border-gold/40 bg-gold/5' : 'border-rim hover:border-rim-hi'
            }`}
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={selected === s}
              onChange={() => setSelected(s)}
              className="mt-0.5 accent-gold"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-2">{s.charAt(0) + s.slice(1).toLowerCase()}</span>
                <StatusBadge status={s} />
              </div>
              <p className="mt-0.5 text-xs text-ink-4">{STATUS_DESC[s]}</p>
            </div>
          </label>
        ))}
      </div>
      {selected === 'BANNED' && (
        <div className="mt-3 border border-fail/20 bg-fail-subtle px-3 py-2 text-xs text-fail">
          Warning: Banning prevents all platform access. This action can be reversed by an admin.
        </div>
      )}
      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
