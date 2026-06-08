import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users, CalendarDays, Trophy, Coins, ChevronLeft, ChevronRight, LayoutDashboard,
} from 'lucide-react';

/**
 * Sidebar Admin: nền đen, brand "Royal Derby" ở đỉnh, list nav items dưới.
 *
 * 2 cơ chế thu/mở:
 *   1. Pinned (state `collapsed`) - người dùng chủ động click nút.
 *   2. Hover-expand - khi đã collapsed, di chuột vào sẽ tạm mở rộng.
 *
 * NavLink tự gắn class "active" cho route đang chọn.
 */
const NAV_ITEMS = [
  { to: '/admin',         label: 'Overview',  icon: LayoutDashboard, end: true },
  { to: '/admin/users',   label: 'Users',     icon: Users },
  { to: '/admin/races',   label: 'Races',     icon: CalendarDays },
  { to: '/admin/horses',  label: 'Horses',    icon: Trophy },
  { to: '/admin/betting', label: 'Betting',   icon: Coins },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`adm-sidebar${collapsed ? ' is-collapsed' : ''}`}
    >
      <div className="adm-sidebar__brand">
        <span className="adm-sidebar__brand-royal">Royal</span>
        <span className="adm-sidebar__brand-derby">Derby</span>
      </div>

      <nav className="adm-sidebar__nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `adm-sidebar__item${isActive ? ' is-active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="adm-sidebar__icon" />
            <span className="adm-sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="adm-sidebar__toggle"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        <span>Thu gọn</span>
      </button>
    </aside>
  );
}
