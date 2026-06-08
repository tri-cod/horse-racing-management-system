import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { ROLES, ROLE_LABELS } from '../../constants/userRoles';

/**
 * Modal đổi vai trò người dùng.
 *
 * Đặc tính UX:
 *  - ESC để đóng (nếu không đang submit).
 *  - Click backdrop để đóng.
 *  - Khoá scroll body khi mở.
 *  - Disable nút Lưu nếu chưa đổi role hoặc đang submit.
 *  - Reset selectedRole khi đổi user hoặc khi mở/đóng.
 */
export default function ChangeRoleModal({ user, onClose, onConfirm, submitting }) {
  const [selectedRole, setSelectedRole] = useState(user?.role || '');

  // Reset selection mỗi khi mở modal với 1 user mới
  useEffect(() => {
    setSelectedRole(user?.role || '');
  }, [user]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!user) return undefined;
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [user, submitting, onClose]);

  if (!user) return null;

  const noChange = selectedRole === user.role;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noChange || submitting) return;
    onConfirm(selectedRole);
  };

  return (
    <div
      className="au-modal__backdrop"
      onClick={() => { if (!submitting) onClose(); }}
    >
      <div
        className="au-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="au-role-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="au-modal__header">
          <h2 id="au-role-modal-title" className="au-modal__title">
            Change roles
          </h2>
          <button
            type="button"
            className="au-modal__close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="au-modal__body">
            <p className="au-modal__meta">
              User:{' '}
              <strong>{user.fullName || user.email}</strong>
              {user.email && user.fullName && (
                <span className="au-modal__meta-sub"> · {user.email}</span>
              )}
            </p>

            <label className="au-modal__label" htmlFor="au-role-select">
              New role
            </label>
            <select
              id="au-role-select"
              className="au-modal__select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={submitting}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]} ({r})
                </option>
              ))}
            </select>

            {noChange && (
              <p className="au-modal__hint">
                Please choose a different role than your current one to save.
              </p>
            )}
          </div>

          <footer className="au-modal__footer">
            <button
              type="button"
              className="au-btn au-btn--ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="au-btn au-btn--primary"
              disabled={noChange || submitting}
            >
              {submitting ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
