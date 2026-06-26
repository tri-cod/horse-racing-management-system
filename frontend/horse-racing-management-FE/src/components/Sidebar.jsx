import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardCheck, Plus, BadgeDollarSign,
  Flag, Shield, ClipboardList, Ticket, Wallet, UserCog, TrendingUp,
  User, LogOut, Landmark, PencilLine, FlagTriangleRight,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import '../assets/css/Sidebar.css';

const ROLE_ITEMS = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Admin Panel',      href: '/admin/users' },
    { icon: ClipboardCheck,  label: 'Approve Horses',   href: '/admin/approve-horses' },
    { icon: Plus,            label: 'Create Race',       href: '/admin/races/create' },
    { icon: BadgeDollarSign, label: 'Deposit Requests',  href: '/admin/deposits' },
    { icon: PencilLine,      label: 'Edit Race',         href: '/admin/races' },
    { icon: TrendingUp,      label: 'Set Odds',          href: '/admin/set-odds' },
    { icon: Landmark,        label: 'System Wallet',     href: '/admin/wallet' },
  ],
  STAFF: [
    { icon: BadgeDollarSign, label: 'Deposit Requests',  href: '/admin/deposits' },
    { icon: TrendingUp,      label: 'Set Odds',          href: '/admin/set-odds' },
    { icon: Landmark,        label: 'System Wallet',     href: '/admin/wallet' },
  ],
  REFEREE: [
    { icon: Flag,            label: 'Race Control',      href: '/referee/races' },
  ],
  HORSE_OWNER: [
    { icon: Shield,             label: 'My Horses',         href: '/horse-owner/horses' },
    { icon: ClipboardList,      label: 'My Registrations',  href: '/horse-owner/race-registrations' },
    { icon: Wallet,             label: 'My Wallet',         href: '/my-wallet' },
    { icon: FlagTriangleRight,  label: 'Register to Race',  href: '/horse-owner/register-race' },
  ],
  TRAINER: [
    { icon: UserCog,         label: 'My Profile',        href: '/trainer/profile' },
    { icon: Wallet,          label: 'My Wallet',         href: '/my-wallet' },
  ],
  USER: [
    { icon: Ticket,          label: 'My Bets',           href: '/my-bets' },
    { icon: Wallet,          label: 'My Wallet',         href: '/my-wallet' },
  ],
  SPECTATOR: [
    { icon: Ticket,          label: 'My Bets',           href: '/my-bets' },
    { icon: Wallet,          label: 'My Wallet',         href: '/my-wallet' },
  ],
  JOCKEY: [
    { icon: Wallet,          label: 'My Wallet',         href: '/my-wallet' },
  ],
};

const ROLE_LABEL = {
  ADMIN: 'Administrator', STAFF: 'Staff', REFEREE: 'Referee',
  HORSE_OWNER: 'Horse Owner', TRAINER: 'Trainer', USER: 'Member',
  SPECTATOR: 'Spectator', JOCKEY: 'Jockey',
};

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  if (!user) return null;

  const items = ROLE_ITEMS[user.role] ?? [];
  if (items.length === 0) return null;

  const initial = user.username?.charAt(0)?.toUpperCase() || 'U';
  const roleLabel = ROLE_LABEL[user.role] || user.role;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      {/* Brand mark */}
      <a href="/" className="sidebar__brand">
        <img src="/logopage.png" alt="Royal Derby" className="sidebar__brand-img" />
      </a>

      {/* Account block */}
      <div className="sidebar__account">
        <div className="sidebar__account-avatar">{initial}</div>
        <div className="sidebar__account-info">
          <span className="sidebar__account-name">{user.username}</span>
          <span className="sidebar__account-role">{roleLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Sidebar">
        <span className="sidebar__section-label">Navigation</span>
        {items.map(({ icon: Icon, label, href }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
            }
          >
            <span className="sidebar__icon"><Icon size={18} strokeWidth={1.8} /></span>
            <span className="sidebar__label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
          }
        >
          <span className="sidebar__icon"><User size={18} strokeWidth={1.8} /></span>
          <span className="sidebar__label">Account</span>
        </NavLink>

        <button className="sidebar__item sidebar__item--logout" onClick={handleLogout}>
          <span className="sidebar__icon"><LogOut size={18} strokeWidth={1.8} /></span>
          <span className="sidebar__label">Log Out</span>
        </button>
      </div>
    </aside>
  );
}
