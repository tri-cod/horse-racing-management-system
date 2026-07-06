import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
 Search, Settings, LogOut, User, TrendingUp, LayoutDashboard,
 ClipboardCheck, Plus, BadgeDollarSign, Flag, Shield, ClipboardList,
 Wallet, UserCog, Ticket, Landmark, PencilLine, FlagTriangleRight, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import NotificationBell from '@/components/NotificationBell';
import type { UserRole } from '@/types';

interface NavItem { icon: LucideIcon; label: string; href: string }

const ROLE_MENU: Partial<Record<UserRole, NavItem[]>> = {
 ADMIN: [
 { icon: LayoutDashboard, label: 'Admin Panel', href: '/admin/users' },
 { icon: ClipboardCheck, label: 'Approve Horses', href: '/admin/approve-horses' },
 { icon: Plus, label: 'Create Race', href: '/admin/races/create' },
 { icon: BadgeDollarSign, label: 'Deposit Requests', href: '/admin/deposits' },
 { icon: PencilLine, label: 'Edit Race', href: '/admin/races' },
 { icon: TrendingUp, label: 'Set Odds', href: '/admin/set-odds' },
 { icon: Landmark, label: 'System Wallet', href: '/admin/wallet' },
 ],
 REFEREE: [{ icon: Flag, label: 'Race Control', href: '/referee/races' }],
 HORSE_OWNER: [
 { icon: Shield, label: 'My Horses', href: '/horse-owner/horses' },
 { icon: ClipboardList, label: 'My Registrations', href: '/horse-owner/race-registrations' },
 { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
 { icon: FlagTriangleRight, label: 'Register to Race', href: '/horse-owner/register-race' },
 ],
 TRAINER: [{ icon: UserCog, label: 'My Profile', href: '/trainer/profile' }, { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
 USER: [{ icon: Ticket, label: 'My Bets', href: '/my-bets' }, { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
 JOCKEY: [{ icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
};

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
 <button type="button"
 className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-on-gold text-xs font-bold cursor-pointer">
 {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
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
