import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, LogOut, User, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import NotificationBell from '@/components/NotificationBell';
import UserAvatar from '@/components/features/admin/UserAvatar';
import type { UserRole } from '@/types';
import { ROLE_MENU } from '@/config/roleMenu';

const WALLET_ROLES = new Set<UserRole>(['USER', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']);

const fmtBalance = (n: number | null) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showWallet = user ? WALLET_ROLES.has(user.role) : false;
  const { balance, loading: balanceLoading } = useWalletBalance(showWallet);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { navigate(`/races?search=${encodeURIComponent(query.trim())}`); setQuery(''); }
  };

  const roleItems = user ? (ROLE_MENU[user.role] ?? []) : [];

  const openMenu = () => { clearTimeout(closeTimer.current); setMenuOpen(true); };
  const closeMenu = () => { closeTimer.current = setTimeout(() => setMenuOpen(false), 150); };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-rim bg-surface/80 backdrop-blur-sm px-6">
      <form className="flex items-center gap-2 flex-1 max-w-sm" onSubmit={handleSearch}>
        <Search size={14} className="text-ink-4 shrink-0" />
        <input
          type="text"
          placeholder="Search races..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded border border-rim bg-surface-input px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-4 outline-none focus:border-gold transition-colors"
        />
      </form>

      <div className="flex items-center gap-3">
        {showWallet && (
          <Link to="/my-wallet" className="flex items-center gap-2 rounded-md border border-rim bg-surface-raised px-3 py-1.5 transition-colors hover:border-gold/50">
            <Wallet size={14} className="text-gold" />
            <span className="tnum text-sm font-semibold text-ink">
              {balanceLoading ? '...' : fmtBalance(balance)}
            </span>
          </Link>
        )}

        <NotificationBell />

        <Link to="/profile" className="rounded p-1.5 text-ink-3 hover:text-ink hover:bg-surface-overlay transition-colors" title="Settings">
          <Settings size={17} strokeWidth={1.8} />
        </Link>

        <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
          <button type="button" className="cursor-pointer">
            <UserAvatar name={user?.fullName || user?.username} avatarUrl={user?.avatarUrl} size={32} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[180px] rounded-lg border border-rim bg-surface-overlay py-1 shadow-xl z-50">
              <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-input hover:text-ink transition-colors"
                onClick={() => navigate('/profile')}>
                <User size={14} /> Account
              </button>
              {roleItems.length > 0 && <div className="my-1 h-px bg-rim" />}
              {roleItems.map(({ icon: Icon, label, href }) => (
                <button key={href}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-ink-2 hover:bg-surface-input hover:text-ink transition-colors"
                  onClick={() => navigate(href)}>
                  <Icon size={14} /> {label}
                </button>
              ))}
              <div className="my-1 h-px bg-rim" />
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-fail hover:bg-fail-subtle hover:text-fail transition-colors"
                onClick={() => { logout(); navigate('/'); }}>
                <LogOut size={14} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
