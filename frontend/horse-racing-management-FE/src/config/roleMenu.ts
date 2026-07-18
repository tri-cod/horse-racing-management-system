import {
  LayoutDashboard, Flag,
  Shield, ClipboardList, Ticket, Wallet, UserCog, TrendingUp,
  Landmark, PencilLine, FlagTriangleRight, Undo2, Gavel, Send, type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface NavItem { icon: LucideIcon; label: string; href: string }

export const ROLE_MENU: Partial<Record<UserRole, NavItem[]>> = {
  ADMIN: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: UserCog, label: 'Manage Users', href: '/admin/users' },
    { icon: Undo2, label: 'Horse Withdrawals', href: '/admin/withdrawal-requests' },
    { icon: PencilLine, label: 'Manage Races', href: '/admin/races' },
    { icon: Landmark, label: 'System Wallet', href: '/admin/wallet' },
  ],
  STAFF: [
    { icon: TrendingUp, label: 'Set Odds', href: '/admin/races?tab=odds' },],
REFEREE: [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/referee/dashboard' },
        { icon: Flag, label: 'Race Control', href: '/referee/races' },
        { icon: ClipboardList, label: 'My Races', href: '/referee/my-races' },
        { icon: Gavel, label: 'Penalty History', href: '/referee/penalties' },
        { icon: UserCog, label: 'My Profile', href: '/referee/profile' },
        { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
    ],
  HORSE_OWNER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/horse-owner/dashboard' },
    { icon: Shield, label: 'My Horses', href: '/horse-owner/horses' },
    { icon: ClipboardList, label: 'My Registrations', href: '/horse-owner/race-registrations' },
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
    { icon: FlagTriangleRight, label: 'Register to Race', href: '/horse-owner/register-race' },
  ],
  TRAINER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/trainer/dashboard' },
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
  ],
  USER: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Ticket, label: 'My Bets', href: '/my-bets' },
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
  ],
  JOCKEY: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/jockey/dashboard' },
    { icon: UserCog, label: 'My Profile', href: '/jockey/profile' },
    { icon: Send, label: 'Race Requests', href: '/jockey/race-requests' },
    { icon: Wallet, label: 'My Wallet', href: '/my-wallet' },
  ],
};