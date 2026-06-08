import { Search, X } from 'lucide-react';
import { ROLES, ROLE_LABELS, STATUSES, STATUS_LABELS } from '../../constants/userRoles';

/**
 * Thanh công cụ lọc ở trên đầu bảng:
 *  - Ô tìm kiếm (debounced ở hook).
 *  - Dropdown role.
 *  - Dropdown status.
 *  - Nút Reset hiện khi có ít nhất 1 filter đang áp dụng.
 */
export default function UsersToolbar({
  keywordInput,
  role,
  status,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
  onReset,
}) {
  const hasFilters = Boolean(keywordInput || role || status);

  return (
    <div className="au-toolbar">
      <div className="au-toolbar__search">
        <Search className="au-toolbar__search-icon" size={16} />
        <input
          type="text"
          className="au-toolbar__search-input"
          placeholder="Search by name, email, or phone number…"
          value={keywordInput}
          onChange={(e) => onKeywordChange(e.target.value)}
          aria-label="Search for users"
        />
        {keywordInput && (
          <button
            type="button"
            className="au-toolbar__search-clear"
            onClick={() => onKeywordChange('')}
            aria-label="Delete search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <select
        className="au-toolbar__select"
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        aria-label="Filter by role"
      >
        <option value="">Tất cả vai trò</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
        ))}
      </select>

      <select
        className="au-toolbar__select"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by status"
      >
        <option value="">Tất cả trạng thái</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          className="au-toolbar__reset"
          onClick={onReset}
        >
          Xoá bộ lọc
        </button>
      )}
    </div>
  );
}
