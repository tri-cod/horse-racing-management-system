import { NavLink, useNavigate } from 'react-router-dom';
import {
 LayoutDashboard, ClipboardCheck, Plus, BadgeDollarSign, Flag,
 Shield, ClipboardList, Ticket, Wallet, UserCog, TrendingUp,
 User, LogOut, Landmark, PencilLine, FlagTriangleRight, type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UserAvatar from '@/components/features/admin/UserAvatar';
import type { UserRole } from '@/types';

interface NavItem { icon: LucideIcon; label: string; href: string; end?: boolean }

const ROLE_ITEMS: Partial<Record<UserRole, NavItem[]>> = {
 ADMIN: [
 { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
 { icon: UserCog, label: 'Manage Users', href: '/admin/users' },
 { icon: ClipboardCheck, label: 'Approve Horses', href: '/admin/approve-horses' },
 { icon: Plus, label: 'Create Race', href: '/admin/races/create' },
 { icon: BadgeDollarSign, label: 'Deposit Requests', href: '/admin/deposits' },
 { icon: PencilLine, label: 'Manage Races', href: '/admin/races', end: true },
 { icon: TrendingUp, label: 'Set Odds', href: '/admin/set-odds' },
 { icon: Landmark, label: 'System Wallet', href: '/admin/wallet' },
 ],
 REFEREE: [
     { icon: LayoutDashboard, label: 'Dashboard', href: '/referee/dashboard' },
     { icon: Flag, label: 'Race Control', href: '/referee/races' }],
 HORSE_OWNER: [
     { icon: LayoutDashboard, label: 'Dashboard', href: '/horse-owner/dashboard' },
 { icon: Shield, label: 'My Horses', href: '/horse-owner/horses' },
 { icon: ClipboardList, label: 'My Registrations', href: '/horse-owner/race-registrations' },
 { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
 { icon: FlagTriangleRight, label: 'Register to Race', href: '/horse-owner/register-race' },
 ],
 TRAINER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/trainer/dashboard' },
    { icon: UserCog, label: 'My Profile', href: '/trainer/profile' }, 
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
 USER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Ticket, label: 'My Bets', href: '/my-bets' }, 
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
    JOCKEY: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/jockey/dashboard' },
        { icon: UserCog, label: 'My Profile', href: '/jockey/profile' },
        { icon: Wallet, label: 'My Wallet', href: '/my-wallet' }],
};

const ROLE_LABEL: Partial<Record<UserRole, string>> = {
 ADMIN: 'Administrator', REFEREE: 'Referee', HORSE_OWNER: 'Horse Owner',
 TRAINER: 'Trainer', USER: 'Member', JOCKEY: 'Jockey',
};

const navItem = ({ isActive }: { isActive: boolean }) =>
`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-gold/10 text-gold' : 'text-ink-3 hover:text-ink hover:bg-surface-overlay'}`;

export default function Sidebar() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 if (!user) return null;

 const items = ROLE_ITEMS[user.role] ?? [];
 if (items.length === 0) return null;

 return (
 <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-rim bg-surface-raised">
 <a href="/" className="flex items-center justify-center border-b border-rim px-4 py-5">
 <img src="/logopage.png" alt="Royal Derby" className="h-10 object-contain" />
 </a>

 <div className="flex items-center gap-3 border-b border-rim px-4 py-3">
 <UserAvatar name={user.fullName || user.username} avatarUrl={user.avatarUrl} size={36} />
 <div className="min-w-0">
 <p className="truncate text-sm font-medium text-ink">{user.username}</p>
 <p className="truncate text-xs text-ink-4">{ROLE_LABEL[user.role] ?? user.role}</p>
 </div>
 </div>

 <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5" aria-label="Sidebar">
 <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-4">Navigation</p>
 {items.map(({ icon: Icon, label, href, end }) => (
 <NavLink key={href} to={href} end={end} className={navItem}>
 <Icon size={18} strokeWidth={1.8} />
 <span>{label}</span>
 </NavLink>
 ))}
 </nav>

 <div className="border-t border-rim px-3 py-3 space-y-0.5">
 <NavLink to="/profile" className={navItem}>
 <User size={18} strokeWidth={1.8} /> Account
 </NavLink>
 <button
 className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-fail hover:bg-fail-subtle transition-colors"
 onClick={() => { logout(); navigate('/'); }}
 >
 <LogOut size={18} strokeWidth={1.8} /> Log Out
 </button>
 </div>
 </aside>
 );
}
