import { Edit, Shield } from 'lucide-react';
import UserAvatar from './UserAvatar';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB');
}

export default function UserRow({ user, onEditRole, onEditStatus }) {
  return (
    <tr className="users-table__row">
      <td className="users-table__td">
        <div className="users-table__user-cell">
          <UserAvatar name={user.fullName} size={36} />
          <div>
            <div className="users-table__name">{user.fullName}</div>
            <div className="users-table__email">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="users-table__td users-table__td--muted">{user.phone || '—'}</td>
      <td className="users-table__td"><RoleBadge role={user.role} /></td>
      <td className="users-table__td"><StatusBadge status={user.status} /></td>
      <td className="users-table__td users-table__td--muted">{formatDate(user.createdAt)}</td>
      <td className="users-table__td">
        <div className="users-table__actions">
          <button
            type="button"
            className="users-table__action-btn"
            onClick={() => onEditRole(user)}
            title="Change role"
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            className="users-table__action-btn"
            onClick={() => onEditStatus(user)}
            title="Change status"
          >
            <Shield size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
