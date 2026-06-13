import UserRow from './UserRow';
import EmptyState from '../ui/EmptyState';
import { Users } from 'lucide-react';
import '../../assets/css/admin/UsersTable.css';

export default function UsersTable({ users, onEditRole, onEditStatus }) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        subtitle="Try adjusting your search or filter criteria."
      />
    );
  }

  return (
    <div className="users-table-wrap">
      <table className="users-table">
        <thead>
          <tr>
            <th className="users-table__th">User</th>
            <th className="users-table__th">Phone</th>
            <th className="users-table__th">Role</th>
            <th className="users-table__th">Status</th>
            <th className="users-table__th">Joined</th>
            <th className="users-table__th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} onEditRole={onEditRole} onEditStatus={onEditStatus} />
          ))}
        </tbody>
      </table>
    </div>
  );
}