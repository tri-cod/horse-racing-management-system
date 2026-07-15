import { useState, useEffect } from 'react';
import { updateUserRole, updateUserStatus } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import type { User, UserRole, UserStatus } from '@/types';

const ROLES: UserRole[] = ['ADMIN', 'STAFF', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'USER'];
const STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED'];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin', STAFF: 'Staff', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
  TRAINER: 'Trainer', JOCKEY: 'Jockey', USER: 'Member',
};

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

// Xử lý cả role và status trong 1 modal duy nhất thay vì 2 nút/2 modal riêng —
// chỉ gọi API cho phần thực sự thay đổi, giống logic "skip nếu không đổi" của
// 2 modal cũ (ChangeRoleModal/ChangeStatusModal).
export default function ManageUserModal({ user, onClose, onSuccess }: Props) {
  const [role, setRole] = useState<UserRole>('USER');
  const [status, setStatus] = useState<UserStatus>('ACTIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) { setRole(user.role); setStatus(user.status); setError(null); }
  }, [user]);

  if (!user) return null;

  const roleChanged = role !== user.role;
  const statusChanged = status !== user.status;
  const hasChanges = roleChanged || statusChanged;

  const handleConfirm = async () => {
    if (!hasChanges) { onClose(); return; }
    setLoading(true); setError(null);
    try {
      const calls: Promise<unknown>[] = [];
      if (roleChanged) calls.push(updateUserRole(user.id, role));
      if (statusChanged) calls.push(updateUserStatus(user.id, status));
      await Promise.all(calls);

      const parts = [roleChanged && 'role', statusChanged && 'status'].filter(Boolean);
      onSuccess(`Updated ${parts.join(' and ')} successfully.`);
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to update user.'));
    } finally { setLoading(false); }
  };

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">User Account</p>
      <h3 className="font-serif text-base font-bold text-ink">Manage User</h3>
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
        disabled={loading || !hasChanges}
        className={`px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
          status === 'BANNED' && statusChanged
            ? 'bg-fail text-white hover:bg-fail/80'
            : 'bg-navy text-on-blue hover:bg-navy-hi'
        }`}
      >
        {loading ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="xl" footer={footer}>
      <p className="mb-4 text-sm font-semibold text-ink">{user.fullName}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Role */}
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">Role</p>
          <div className="flex flex-col gap-2">
            {ROLES.map((r) => (
              <label
                key={r}
                className={`flex cursor-pointer items-center gap-3 border px-3 py-2 transition-colors ${
                  role === r ? 'border-gold/40 bg-gold/5' : 'border-rim hover:border-rim-hi'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="accent-gold"
                />
                <span className="flex-1 text-sm text-ink-2">{ROLE_LABELS[r]}</span>
                <RoleBadge role={r} />
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
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
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
