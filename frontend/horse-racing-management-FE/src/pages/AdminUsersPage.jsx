import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useToast } from '../components/ui/ToastProvider';
import UsersTable from '../components/admin/UsersTable';
import ChangeRoleModal from '../components/admin/ChangeRoleModal';
import ChangeStatusModal from '../components/admin/ChangeStatusModal';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../assets/css/AdminUsersPage.css';

const ROLES = ['', 'ADMIN', 'MANAGER', 'STAFF', 'REFEREE', 'HORSE_OWNER', 'TRAINER', 'JOCKEY', 'SPECTATOR', 'USER'];
const STATUSES = ['', 'ACTIVE', 'INACTIVE', 'BANNED'];

export default function AdminUsersPage() {
  const { user } = useContext(AuthContext);
  const addToast = useToast();

  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const debounceRef = useRef(null);

  const [editRoleUser, setEditRoleUser] = useState(null);
  const [editStatusUser, setEditStatusUser] = useState(null);

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setKeyword(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(val);
      setPage(0);
    }, 400);
  };

  const handleFilterChange = useCallback((setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  }, []);

  const hasFilters = keyword || role || status;

  const { users, totalElements, totalPages, loading, error, refetch, setCurrentPage } = useAdminUsers({
    keyword: debouncedKeyword,
    role,
    status,
    page,
    size: 10,
  });

  useEffect(() => { setCurrentPage(page); }, [page, setCurrentPage]);

  const handleClear = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setRole('');
    setStatus('');
    setPage(0);
  };

  const onActionSuccess = (msg) => {
    addToast(msg, 'success');
    refetch();
  };

  return (
    <div className="admin-users-page">
<div className="admin-users-page__content">
        <div className="admin-users-page__toolbar">
          <div className="admin-users-page__search">
            <Search size={16} className="admin-users-page__search-icon" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={keyword}
              onChange={handleKeywordChange}
              className="admin-users-page__search-input"
            />
          </div>

          <div className="admin-users-page__filter">
            <select
              value={role}
              onChange={handleFilterChange(setRole)}
              className="admin-users-page__select"
            >
              <option value="">All Roles</option>
              {ROLES.filter(Boolean).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <ChevronDown size={14} className="admin-users-page__select-icon" />
          </div>

          <div className="admin-users-page__filter">
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="admin-users-page__select"
            >
              <option value="">All Statuses</option>
              {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="admin-users-page__select-icon" />
          </div>

          {hasFilters && (
            <button type="button" className="admin-users-page__clear-btn" onClick={handleClear}>
              Clear filters
            </button>
          )}

          <span className="admin-users-page__count">
            {totalElements} user{totalElements !== 1 ? 's' : ''}
          </span>
        </div>

        {error && (
          <div className="admin-users-page__error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <UsersTable
              users={users}
              onEditRole={setEditRoleUser}
              onEditStatus={setEditStatusUser}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {editRoleUser && (
        <ChangeRoleModal
          user={editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onSuccess={onActionSuccess}
        />
      )}
      {editStatusUser && (
        <ChangeStatusModal
          user={editStatusUser}
          onClose={() => setEditStatusUser(null)}
          onSuccess={onActionSuccess}
        />
      )}
    </div>
  );
}