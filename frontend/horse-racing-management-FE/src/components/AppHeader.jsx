import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Settings, LogOut, User, TrendingUp,
  LayoutDashboard, ClipboardCheck, Plus, BadgeDollarSign,
  Flag, Shield, ClipboardList, Wallet, UserCog, Ticket, Landmark, PencilLine, FlagTriangleRight,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import '../assets/css/AppHeader.css';

const ROLE_MENU = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Admin Panel',     href: '/admin/users' },
    { icon: ClipboardCheck,  label: 'Approve Horses',  href: '/admin/approve-horses' },
    { icon: Plus,            label: 'Create Race',      href: '/admin/races/create' },
    { icon: BadgeDollarSign, label: 'Deposit Requests', href: '/admin/deposits' },
    { icon: PencilLine,      label: 'Edit Race',        href: '/admin/races' },
    { icon: TrendingUp,      label: 'Set Odds',         href: '/admin/set-odds' },
    { icon: Landmark,        label: 'System Wallet',    href: '/admin/wallet' },
  ],
  STAFF: [
    { icon: BadgeDollarSign, label: 'Deposit Requests', href: '/admin/deposits' },
    { icon: TrendingUp,      label: 'Set Odds',         href: '/admin/set-odds' },
    { icon: Landmark,        label: 'System Wallet',    href: '/admin/wallet' },
  ],
  REFEREE: [{ icon: Flag, label: 'Race Control', href: '/referee/races' }],
  HORSE_OWNER: [
    { icon: Shield,            label: 'My Horses',        href: '/horse-owner/horses' },
    { icon: ClipboardList,     label: 'My Registrations', href: '/horse-owner/race-registrations' },
    { icon: Wallet,            label: 'My Wallet',        href: '/my-wallet' },
    { icon: FlagTriangleRight, label: 'Register to Race', href: '/horse-owner/register-race' },
  ],
  TRAINER:  [{ icon: UserCog, label: 'My Profile', href: '/trainer/profile' }, { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
  USER:     [{ icon: Ticket, label: 'My Bets', href: '/my-bets' }, { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
  SPECTATOR:[{ icon: Ticket, label: 'My Bets', href: '/my-bets' }, { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
  JOCKEY:   [{ icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
};

const WALLET_ROLES = new Set(['USER', 'SPECTATOR', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']);

export default function AppHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/races?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleItems = ROLE_MENU[user?.role] ?? [];
  const showWallet = WALLET_ROLES.has(user?.role);

  return (
    <header className="app-header">
      <form className="app-header__search" onSubmit={handleSearch}>
        <Search size={14} className="app-header__search-icon" />
        <input
          type="text"
          placeholder="Search races..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="app-header__search-input"
        />
      </form>

      <div className="app-header__actions">
        {showWallet && (
          <Link to="/my-wallet" className="app-header__wallet">
            <Wallet size={13} className="app-header__wallet-icon" />
            My Wallet
          </Link>
        )}

        <NotificationBell />

        <Link to="/profile" className="app-header__icon-btn" title="Settings">
          <Settings size={17} strokeWidth={1.8} />
        </Link>

        <div className="app-header__user">
          <button type="button" className="app-header__avatar" title="Account">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>

          <div className="app-header__dropdown">
            <div className="app-header__dropdown-inner">
              <button className="app-header__dropdown-item" onClick={() => navigate('/profile')}>
                <User size={14} /> Account
              </button>

              {roleItems.length > 0 && <div className="app-header__dropdown-divider" />}

              {roleItems.map(({ icon: Icon, label, href }) => (
                <button
                  key={href}
                  className="app-header__dropdown-item"
                  onClick={() => navigate(href)}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}

              <div className="app-header__dropdown-divider" />

              <button
                className="app-header__dropdown-item app-header__dropdown-item--danger"
                onClick={handleLogout}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
