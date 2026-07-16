import { Shield, ToggleLeft } from 'lucide-react';
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import type { User } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface UserRowProps {
  user: User;
  onChangeRole: (user: User) => void;
  onChangeStatus: (user: User) => void;
}

export default function UserRow({ user, onChangeRole, onChangeStatus }: UserRowProps) {
  return (
    <tr className="transition-colors hover:bg-surface-overlay/40">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <UserAvatar name={user.fullName} size={36} />
          <div>
            <p className="text-sm font-semibold text-ink">{user.fullName}</p>
            <p className="text-xs text-ink-4">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-ink-2">{user.phone || '—'}</td>
      <td className="px-5 py-3.5"><RoleBadge role={user.role} /></td>
      <td className="px-5 py-3.5"><StatusBadge status={user.status} /></td>
      <td className="tnum px-5 py-3.5 text-sm text-ink-3">{formatDate(user.createdAt)}</td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeRole(user)}
            title="Change role"
            className="inline-flex items-center gap-1.5 border border-rim px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:border-rim-hi hover:bg-surface-overlay hover:text-gold"
          >
            <Shield size={13} /> Role
          </button>
          <button
            type="button"
            onClick={() => onChangeStatus(user)}
            title="Change status"
            className="inline-flex items-center gap-1.5 border border-rim px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:border-rim-hi hover:bg-surface-overlay hover:text-gold"
          >
            <ToggleLeft size={13} /> Status
          </button>
        </div>
      </td>
    </tr>
  );
}