import { useState, useEffect } from 'react';
import { updateUserStatus } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import StatusBadge from './StatusBadge';
import type { User, UserStatus } from '@/types';

const STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED'];

const STATUS_DESC: Record<UserStatus, string> = {
  ACTIVE: 'Can log in and use the platform normally.',
  INACTIVE: 'Account disabled but not banned.',
  BANNED: 'Blocked from accessing the platform.',
};

interface Props {
  user: User | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChangeStatusModal({ user, onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setStatus(user.status); setError(null); }
  }, [user]);

  if (!user) return null;

  const statusChanged = status !== user.status;

  const handleConfirm = async () => {
    if (!statusChanged) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      await updateUserStatus(user.id, status);
      onSuccess('Updated status successfully.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to update status.'));
    } finally { setLoading(false); }
  };

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Account</p>
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
        disabled={loading || !statusChanged}
        className={`px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
          status === 'BANNED'
            ? 'bg-fail text-white hover:bg-fail/80'
            : 'bg-navy text-on-blue hover:bg-navy-hi'
        }`}
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="lg" footer={footer}>
      <p className="mb-4 text-sm font-semibold text-ink">{user.fullName}</p>

      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Status</p>
      <div className="flex flex-col gap-2">
        {STATUSES.map((s) => (
          <label
            key={s}
            className={`flex cursor-pointer items-start gap-3 border px-3 py-2.5 transition-colors ${
              status === s ? 'border-gold/40 bg-gold/5' : 'border-rim hover:border-rim-hi'
            }`}
          >
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
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

      {status === 'BANNED' && statusChanged && (
        <div className="mt-3 border border-fail/20 bg-fail-subtle px-3 py-2 text-xs text-fail">
          Warning: Banning prevents all platform access. This can be reversed later.
        </div>
      )}

      {error && <p className="mt-4 text-sm text-fail">{error}</p>}
    </Modal>
  );
}