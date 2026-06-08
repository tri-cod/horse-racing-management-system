import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, UserCog, Lock, Unlock } from 'lucide-react';

/**
 * Dropdown menu hiện khi click vào nút "⋯" trên 1 hàng user.
 *
 * Hành vi:
 *  - Click vào nút: toggle menu.
 *  - Click ra ngoài: đóng menu.
 *  - Bấm ESC: đóng menu.
 *  - Khi chính user đang đăng nhập nằm trên row đó, ta disable
 *    cả 2 action để tránh tự khoá / tự đổi role của mình.
 */
export default function UserRowMenu({
  user,
  isSelf,
  onChangeRole,
  onToggleBan,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setOpen(false); };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const isBanned = user.status === 'BANNED';

  const handleSelectRole = () => {
    setOpen(false);
    onChangeRole(user);
  };
  const handleToggle = () => {
    setOpen(false);
    onToggleBan(user);
  };

  return (
    <div className="au-rowmenu" ref={wrapRef}>
      <button
        type="button"
        className={`au-rowmenu__trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="Open the operations menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div className="au-rowmenu__panel" role="menu">
          <button
            type="button"
            className="au-rowmenu__item"
            role="menuitem"
            onClick={handleSelectRole}
            disabled={isSelf}
            title={isSelf ? 'You cant change your own role' : undefined}
          >
            <UserCog size={16} />
            <span>Đổi vai trò</span>
          </button>

          <button
            type="button"
            className={`au-rowmenu__item${isBanned ? '' : ' au-rowmenu__item--danger'}`}
            role="menuitem"
            onClick={handleToggle}
            disabled={isSelf}
            title={isSelf ? 'You cannot lock your own account.' : undefined}
          >
            {isBanned ? <Unlock size={16} /> : <Lock size={16} />}
            <span>{isBanned ? 'Unlock account' : 'Lock account'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
