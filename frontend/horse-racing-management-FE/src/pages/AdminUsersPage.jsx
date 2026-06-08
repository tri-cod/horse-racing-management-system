import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAdminUsers } from '../hooks/useAdminUsers';
import UsersToolbar    from '../components/admin/UsersToolbar';
import UsersTable      from '../components/admin/UsersTable';
import Pagination      from '../components/admin/Pagination';
import ChangeRoleModal from '../components/admin/ChangeRoleModal';
import ConfirmDialog   from '../components/admin/ConfirmDialog';
import Toast           from '../components/admin/Toast';

/**
 * Trang quản lý người dùng.
 *
 * Cấu trúc theo flow yêu cầu:
 *   - Header trang (title + tổng số user).
 *   - Toolbar lọc.
 *   - Bảng user.
 *   - Pagination.
 *   - Modal đổi role.
 *   - Confirm dialog khoá/mở khoá.
 *   - Toast thông báo kết quả.
 */
export default function AdminUsersPage() {
  const { user: currentUser } = useContext(AuthContext);

  const {
    users, pageInfo, loading, error, mutatingId,
    keywordInput, role, status,
    setKeywordInput, setRole, setStatus, setPage, setSize,
    changeRole, toggleBan, resetFilters, refetch,
  } = useAdminUsers();

  // 2 modal độc lập nhau
  const [roleTarget, setRoleTarget] = useState(null);  // user đang đổi role
  const [banTarget,  setBanTarget]  = useState(null);  // user đang khoá/mở khoá

  const [toast, setToast] = useState(null);
  const showToast = (tone, message) =>
    setToast({ id: Date.now(), tone, message });

  // ---- Action handlers -----------------------------------------------------
  const handleConfirmRole = async (newRole) => {
    const result = await changeRole(roleTarget.id, newRole);
    showToast(result.success ? 'success' : 'error', result.message);
    if (result.success) setRoleTarget(null);
  };

  const handleConfirmBan = async () => {
    const result = await toggleBan(banTarget.id, banTarget.status);
    showToast(result.success ? 'success' : 'error', result.message);
    if (result.success) setBanTarget(null);
  };

  // ---- Render --------------------------------------------------------------
  return (
    <div className="au-page">
      <header className="au-page__header">
        <div>
          <h1 className="au-page__title">User Management</h1>
          <p className="au-page__subtitle">
            View, search, change roles, and ban/unban user accounts.
          </p>
        </div>
        <span className="au-page__total">
          Total: <strong>{pageInfo.totalElements}</strong>
        </span>
      </header>

      <section className="au-card">
        <UsersToolbar
          keywordInput={keywordInput}
          role={role}
          status={status}
          onKeywordChange={setKeywordInput}
          onRoleChange={setRole}
          onStatusChange={setStatus}
          onReset={resetFilters}
        />

        <UsersTable
          users={users}
          loading={loading}
          error={error}
          mutatingId={mutatingId}
          currentUserId={currentUser?.id}
          onRetry={refetch}
          onChangeRole={setRoleTarget}
          onToggleBan={setBanTarget}
        />

        <Pagination
          pageInfo={pageInfo}
          onPageChange={setPage}
          onSizeChange={setSize}
          disabled={loading}
        />
      </section>

      <ChangeRoleModal
        user={roleTarget}
        submitting={mutatingId === roleTarget?.id}
        onClose={() => setRoleTarget(null)}
        onConfirm={handleConfirmRole}
      />

      <ConfirmDialog
        open={Boolean(banTarget)}
        submitting={mutatingId === banTarget?.id}
        title={banTarget?.status === 'BANNED' ? 'Unlock account' : 'Lock account'}
        message={
          banTarget?.status === 'BANNED'
            ? <>Người dùng <strong>{banTarget?.fullName || banTarget?.email}</strong> It will be unlocked and you will be able to log in normally again.</>
            : <>Người dùng <strong>{banTarget?.fullName || banTarget?.email}</strong> Your account will be locked and you will be unable to log in until it is unlocked.</>
        }
        confirmText={banTarget?.status === 'BANNED' ? 'Mở khoá' : 'Khoá tài khoản'}
        tone={banTarget?.status === 'BANNED' ? 'primary' : 'danger'}
        onClose={() => setBanTarget(null)}
        onConfirm={handleConfirmBan}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
