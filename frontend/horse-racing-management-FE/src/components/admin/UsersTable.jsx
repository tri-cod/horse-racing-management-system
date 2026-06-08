import { Users } from 'lucide-react';
import UserAvatar    from './UserAvatar';
import RoleBadge     from './RoleBadge';
import StatusBadge   from './StatusBadge';
import UserRowMenu   from './UserRowMenu';

/**
 * Bảng danh sách user.
 *
 * Trạng thái:
 *  - loading & len = 0: skeleton 6 dòng.
 *  - error: thông báo lỗi + nút Thử lại.
 *  - len = 0 & !loading: empty state.
 *  - bình thường: data rows.
 *
 * Note: API trả về fullName chứ không có username riêng, nên cột "Tên" hiển thị fullName.
 *       Email cho làm hàng phụ bên dưới fullName ở cột cuối cùng nếu màn hẹp.
 */
export default function UsersTable({
  users,
  loading,
  error,
  mutatingId,
  currentUserId,
  onRetry,
  onChangeRole,
  onToggleBan,
}) {
  // ---- Error ---------------------------------------------------------------
  if (error) {
    return (
      <div className="au-state">
        <p className="au-state__title">Đã xảy ra lỗi</p>
        <p className="au-state__message">{error}</p>
        <button type="button" className="au-btn au-btn--primary" onClick={onRetry}>
          Thử lại
        </button>
      </div>
    );
  }

  // ---- Loading lần đầu (chưa có data nào) ----------------------------------
  if (loading && users.length === 0) {
    return (
      <div className="au-table-wrap">
        <table className="au-table">
          <TableHead />
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <tr key={i} className="au-table__row au-table__row--skeleton">
                {Array.from({ length: 7 }).map((__, j) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <td key={j}><span className="au-skel" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // ---- Empty ---------------------------------------------------------------
  if (users.length === 0) {
    return (
      <div className="au-state">
        <Users size={36} className="au-state__icon" />
        <p className="au-state__title">No users</p>
        <p className="au-state__message">Try changing your search filters or keywords.</p>
      </div>
    );
  }

  // ---- Bảng có data --------------------------------------------------------
  return (
    <div className={`au-table-wrap${loading ? ' is-refetching' : ''}`}>
      <table className="au-table">
        <TableHead />
        <tbody>
          {users.map((u) => {
            const isSelf      = currentUserId === u.id;
            const isMutating  = mutatingId   === u.id;
            return (
              <tr key={u.id} className={`au-table__row${isMutating ? ' is-mutating' : ''}`}>
                <td className="au-table__cell au-table__cell--avatar">
                  <UserAvatar name={u.fullName} email={u.email} />
                </td>
                <td className="au-table__cell au-table__cell--name">
                  <div className="au-table__name">{u.fullName || '—'}</div>
                  {isSelf && <span className="au-table__youtag">Bạn</span>}
                </td>
                <td className="au-table__cell au-table__cell--email">{u.email || '—'}</td>
                <td className="au-table__cell"><RoleBadge   role={u.role} /></td>
                <td className="au-table__cell"><StatusBadge status={u.status} /></td>
                <td className="au-table__cell au-table__cell--date">
                  {formatDate(u.createdAt)}
                </td>
                <td className="au-table__cell au-table__cell--actions">
                  <UserRowMenu
                    user={u}
                    isSelf={isSelf}
                    disabled={isMutating}
                    onChangeRole={onChangeRole}
                    onToggleBan={onToggleBan}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TableHead() {
  return (
    <thead>
      <tr>
        <th className="au-table__th au-table__th--avatar"  aria-label="Avatar" />
        <th className="au-table__th">Full name</th>
        <th className="au-table__th">Email</th>
        <th className="au-table__th">Role</th>
        <th className="au-table__th">Status</th>
        <th className="au-table__th">Creation date</th>
        <th className="au-table__th au-table__th--actions" aria-label="Thao tác" />
      </tr>
    </thead>
  );
}

/** Định dạng "07/06/2026 14:32" theo locale vi-VN, an toàn với value null */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(d);
}
