import { Users } from 'lucide-react';
import UserRow from './UserRow';
import EmptyState from '@/components/ui/EmptyState';
import type { User } from '@/types';

interface UsersTableProps {
 users: User[];
 onManage: (user: User) => void;
}

export default function UsersTable({ users, onManage }: UsersTableProps) {
 if (users.length === 0) {
 return <EmptyState icon={Users} title="No users found" subtitle="Try adjusting your search or filter criteria." />;
 }

 return (
 <div className="overflow-hidden border border-rim">
 <table className="w-full">
 <thead className="bg-surface-overlay">
 <tr className="border-b border-rim">
 {['User', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
 <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-4">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-rim">
 {users.map((u) => (
 <UserRow key={u.id} user={u} onManage={onManage} />
 ))}
 </tbody>
 </table>
 </div>
 );
}
