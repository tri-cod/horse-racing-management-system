import { useState } from 'react';
import { Search } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import UsersTable from '@/components/features/admin/UsersTable';
import ChangeRoleModal from '@/components/features/admin/ChangeRoleModal';
import ChangeStatusModal from '@/components/features/admin/ChangeStatusModal';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/ToastProvider';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { User, UserRole, UserStatus } from '@/types';

const ROLES: UserRole[] = ['ADMIN', 'STAFF', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'USER'];
const STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'BANNED'];

const selectCls =
  'border border-rim bg-surface-input px-3 py-2 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-rim-hi transition-colors';

function TableSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="border-b border-rim bg-surface-overlay px-5 py-3">
        <div className="flex gap-10">
          {[160, 80, 70, 70, 80, 80].map((w, i) => (
            <div key={i} className="h-3 animate-pulse rounded-full bg-surface-input" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-rim">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-full bg-surface-overlay" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-overlay" />
                <div className="h-2.5 w-36 animate-pulse rounded-full bg-surface-overlay" />
              </div>
            </div>
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="ml-auto flex gap-2">
              <div className="h-7 w-14 animate-pulse rounded bg-surface-overlay" />
              <div className="h-7 w-16 animate-pulse rounded bg-surface-overlay" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const addToast = useToast();
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [editRoleUser, setEditRoleUser] = useState<User | null>(null);
  const [editStatusUser, setEditStatusUser] = useState<User | null>(null);

  const { users, totalPages, currentPage, setCurrentPage, loading, error, refetch } = useAdminUsers({
    keyword, role, status, size: 10,
  });

  const handleSuccess = (msg: string) => { addToast(msg, 'success'); refetch(); };

  return (
    <div className="px-8 py-6">
      <Seo title="Admin - Users" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="User Management"
        subtitle="Manage roles and status of all Royal Derby members"
      />

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-4" />
          <input
            type="text"
            placeholder="Search by name, email…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full border border-rim bg-surface-input py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-rim-hi transition-colors"
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value as UserRole | '')} className={selectCls}>
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as UserStatus | '')} className={selectCls}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => refetch()} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <UsersTable users={users} onEditRole={setEditRoleUser} onEditStatus={setEditStatusUser} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <ChangeRoleModal user={editRoleUser} onClose={() => setEditRoleUser(null)} onSuccess={handleSuccess} />
      <ChangeStatusModal user={editStatusUser} onClose={() => setEditStatusUser(null)} onSuccess={handleSuccess} />
    </div>
  );
}
