import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
 Menu, X, User, LogOut, LayoutDashboard, ChevronDown,
 MapPin, Trophy, Users, Flag, ArrowRight, Wallet, Plus, Rabbit,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import Container from '@/components/ui/Container';
import NotificationBell from '@/components/NotificationBell';
import { getRaces } from '@/api/raceApi';
import { getJockeyList } from '@/api/jockeyApi';
import { getAllHorses } from '@/api/horseApi';
import type { Race, Jockey, UserRole, HorseCurrentStatusResponse } from '@/types';

const DASHBOARD_ROUTE: Partial<Record<UserRole, string>> = {
 ADMIN: '/admin/users', REFEREE: '/referee/races',
 HORSE_OWNER: '/horse-owner/horses', TRAINER: '/trainer/profile',
 USER: '/my-bets', JOCKEY: '/my-wallet',
};

const WALLET_ROLES = new Set<UserRole>(['USER', 'HORSE_OWNER', 'JOCKEY', 'REFEREE', 'TRAINER']);

const fmtBalance = (n: number | null) =>
 n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : '—';

function fmtDate(iso?: string): string {
 if (!iso) return '—';
 return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RaceBigCard({ race }: { race: Race }) {
 return (
 <Link to={`/races?date=${race.startTime?.slice(0, 10) ?? ''}`}
 className="group relative block h-56 overflow-hidden border border-on-blue/15">
 {race.bannerImageurl
 ? <img src={race.bannerImageurl} alt={race.raceName}
 className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
 : <div className="absolute inset-0 bg-navy-deep" />
 }
 <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/60 to-navy/10" />
 <div className="absolute inset-0 flex flex-col justify-end p-4">
 <p className="text-sm font-bold leading-snug text-on-blue group-hover:text-gold transition-colors line-clamp-2">
 {race.raceName}
 </p>
 <p className="mt-1 text-xs text-on-blue/60">{fmtDate(race.startTime)}</p>
 {race.location && (
 <p className="mt-0.5 flex items-center gap-1 text-xs text-on-blue/50">
 <MapPin size={10} /> {race.location}
 </p>
 )}
 </div>
 </Link>
 );
}

export default function Header() {
 const [menuOpen, setMenuOpen] = useState(false);
 const [scrolled, setScrolled] = useState(false);
 const [activeNav, setActiveNav] = useState<string | null>(null);
 const [allRaces, setAllRaces] = useState<Race[]>([]);
 const [allJockeys, setAllJockeys] = useState<Jockey[]>([]);
 const [allHorses, setAllHorses] = useState<HorseCurrentStatusResponse[]>([]);
 const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
 const userMenuTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
 const [userMenuOpen, setUserMenuOpen] = useState(false);

 const { pathname } = useLocation();
 const navigate = useNavigate();
 const { user, logout } = useAuth();
 const showWallet = user ? WALLET_ROLES.has(user.role) : false;
 const { balance, loading: balanceLoading } = useWalletBalance(showWallet);

 useEffect(() => {
 getRaces({ page: 0, size: 50 }).then((d) => setAllRaces(d.content ?? [])).catch(() => {});
 }, []);

 useEffect(() => {
 if (!user) { setAllJockeys([]); return; }
 getJockeyList().then((d) => setAllJockeys(Array.isArray(d) ? d : [])).catch(() => {});
 }, [user]);

 useEffect(() => {
 getAllHorses().then((d) => setAllHorses(Array.isArray(d) ? d : [])).catch(() => {});
 }, []);

 useEffect(() => {
 const onScroll = () => setScrolled(window.scrollY > 12);
 onScroll();
 window.addEventListener('scroll', onScroll);
 return () => window.removeEventListener('scroll', onScroll);
 }, []);

 useEffect(() => { setMenuOpen(false); setActiveNav(null); }, [pathname]);

 const openNav = useCallback((key: string) => { clearTimeout(closeTimer.current); setActiveNav(key); }, []);
 const closeNav = useCallback(() => { closeTimer.current = setTimeout(() => setActiveNav(null), 150); }, []);
 const keepNav = useCallback(() => { clearTimeout(closeTimer.current); }, []);

 const dashRoute = user ? DASHBOARD_ROUTE[user.role] : undefined;

 const nextRace = allRaces
 .filter((r) => ['ONGOING', 'CLOSED_REGISTRATION', 'OPEN_REGISTRATION'].includes(r.status))
 .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ?? null;

 const previousRaces = allRaces.filter((r) => r.status === 'FINISHED')
 .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()).slice(0, 1);

 const upcomingRaces = allRaces.filter((r) => ['UPCOMING', 'OPEN_REGISTRATION'].includes(r.status) && r.id !== nextRace?.id)
 .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).slice(0, 4);

 const navTrigger = (path: string, label: string, key: string) => {
 const isOpen = activeNav === key;
 const isActive = pathname === path || pathname.startsWith(path + '/');
 const wrapCls =`absolute top-full left-0 right-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`;
 const innerCls =`border-b border-gold/25 bg-navy rounded-b-lg shadow-[0_20px_60px_rgba(13,41,24,0.45)] transition-all duration-200 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`;
 return (
 <li
 className="py-2"
 onMouseEnter={() => openNav(key)}
 onMouseLeave={closeNav}
 >
 <Link to={path}
 className={`flex items-center gap-1 text-sm font-medium tracking-wide transition-colors px-1 ${isActive ? 'text-on-blue' : 'text-on-blue/75 hover:text-on-blue'}`}>
 <span className={`pb-1 border-b-2 transition-colors ${isActive ? 'border-gold' : 'border-transparent hover:border-on-blue/30'}`}>{label}</span>
 <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
 </Link>
 <div className={wrapCls} onMouseEnter={keepNav} onMouseLeave={closeNav}>
 <div className={innerCls}>
 <Container className="py-6">
 {key === 'races' && (
 <>
 <div className="grid grid-cols-4 gap-4">
 <div>
 <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold/70">Previous</p>
 {previousRaces.length === 0
 ? <div className="flex h-44 items-center justify-center bg-on-blue/5 text-xs text-on-blue/40 border border-on-blue/10">No finished races</div>
 : previousRaces.map((r) => <RaceBigCard key={r.id} race={r} />)}
 </div>
 <div>
 <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold/70">Next</p>
 {nextRace
 ? <RaceBigCard race={nextRace} />
 : <div className="flex h-44 items-center justify-center bg-on-blue/5 text-xs text-on-blue/40 border border-on-blue/10">No race scheduled</div>}
 </div>
 <div className="col-span-2">
 <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold/70">Upcoming</p>
 {upcomingRaces.length === 0
 ? <div className="flex h-44 items-center justify-center bg-on-blue/5 text-xs text-on-blue/40 border border-on-blue/10">No upcoming races</div>
 : <div className="grid grid-cols-2 gap-4">
 {upcomingRaces.slice(0, 2).map((r) => <RaceBigCard key={r.id} race={r} />)}
 </div>}
 </div>
 </div>
 <div className="mt-5 flex items-center justify-between border-t border-gold/20 pt-4">
 <Link to="/races" className="inline-flex items-center gap-1.5 text-sm font-medium text-on-blue/70 hover:text-gold transition-colors">
 Full Schedule <ArrowRight size={14} />
 </Link>
 <Link to="/results" className="inline-flex items-center gap-1.5 text-sm font-medium text-on-blue/50 hover:text-on-blue transition-colors">
 <Trophy size={13} /> Results
 </Link>
 </div>
 </>
 )}
 {key === 'results' && (
 <div className="flex gap-4">
 <Link to="/results" className="flex items-center gap-3 border border-on-blue/20 px-5 py-4 transition hover:border-gold hover:bg-on-blue/10">
 <Trophy size={18} className="text-gold shrink-0" />
 <div>
 <p className="text-sm font-semibold text-on-blue">Race Results</p>
 <p className="text-xs text-on-blue/50">Final standings &amp; prize distribution</p>
 </div>
 </Link>
 <Link to="/races" className="flex items-center gap-3 border border-on-blue/20 px-5 py-4 transition hover:border-gold hover:bg-on-blue/10">
 <Flag size={18} className="text-gold shrink-0" />
 <div>
 <p className="text-sm font-semibold text-on-blue">Race Schedule</p>
 <p className="text-xs text-on-blue/50">All upcoming and past races</p>
 </div>
 </Link>
 </div>
 )}
 {key === 'jockeys' && (
 <div className="w-[760px]">
 {allJockeys.length === 0 ? <p className="text-sm text-on-blue/40">No jockeys available</p> : (
 <div className="grid grid-cols-3 gap-x-10 gap-y-3">
 {allJockeys.slice(0, 16).map((j) => {
 const initial = (j.name ?? 'J').charAt(0).toUpperCase();
 const colors = ['bg-gold','bg-purple-600','bg-emerald-600','bg-on-blue/30','bg-red-600','bg-teal-600'];
 const color = colors[j.id % colors.length];
 return (
 <Link key={j.id} to="/jockeys" className="flex items-center gap-3 py-2.5 transition hover:bg-on-blue/10">
 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-on-gold ${color}`}>{initial}</div>
 <span className="text-sm font-medium text-on-blue/85">{j.name}</span>
 </Link>
 );
 })}
 </div>
 )}
 <div className="mt-4 border-t border-gold/20 pt-3">
 <Link to="/jockeys" className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:text-gold-hi transition-colors">
 <Users size={13} /> View all jockeys
 </Link>
 </div>
 </div>
 )}
 {key === 'horses' && (
 <div className="w-[760px]">
 {allHorses.length === 0 ? <p className="text-sm text-on-blue/40">No horses available.</p> : (
 <div className="grid grid-cols-3 gap-x-10 gap-y-3">
 {allHorses.slice(0, 16).map((h) => {
 const initial = (h.horseName ?? 'H').charAt(0).toUpperCase();
 const colors = ['bg-gold','bg-purple-600','bg-emerald-600','bg-on-blue/30','bg-red-600','bg-teal-600'];
 const color = colors[h.horseId % colors.length];
 return (
 <Link key={h.horseId} to="/horses" className="flex items-center gap-3 py-2.5 transition hover:bg-on-blue/10">
 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-on-gold ${color}`}>{initial}</div>
 <span className="text-sm font-medium text-on-blue/85">{h.horseName}</span>
 </Link>
 );
 })}
 </div>
 )}
 <div className="mt-4 border-t border-gold/20 pt-3">
 <Link to="/horses" className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:text-gold-hi transition-colors">
 <Rabbit size={13} /> View all horses
 </Link>
 </div>
 </div>
 )}
 </Container>
 </div>
 </div>
 </li>
 );
 };

 return (
 <header className={`fixed inset-x-0 top-0 z-50 bg-navy transition-shadow duration-300 ${scrolled ? 'shadow-xl shadow-navy-deep/60' : ''}`}>
 {/* Thin brass top rule */}
 <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
 {/* Utility strip */}
 <div className="bg-navy-deep border-b border-on-blue/10">
 <Container className="flex h-9 items-center justify-between">
 <span className="text-[11px] text-on-blue/50">Season {new Date().getFullYear()}</span>
 <div className="flex items-center gap-3">
 {!user ? (
 <>
 <Link to="/login" className="text-[11px] text-on-blue/75 hover:text-on-blue transition-colors">Sign In</Link>
 <span className="text-on-blue/30">·</span>
 <Link to="/register" className="text-[11px] text-gold hover:text-gold-hi transition-colors">Register</Link>
 </>
 ) : (
 <div className="flex items-center gap-3">
 <NotificationBell />
 <span className="text-[11px] text-on-blue/75">{user.username}</span>
 <div className="relative"
 onMouseEnter={() => { clearTimeout(userMenuTimer.current); setUserMenuOpen(true); }}
 onMouseLeave={() => { userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150); }}
 >
 <button className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-[11px] font-bold text-on-gold">
 {user.username?.charAt(0).toUpperCase() ?? 'U'}
 </button>
 {userMenuOpen && (
 <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-rim bg-surface-raised shadow-2xl shadow-black/60"
 onMouseEnter={() => clearTimeout(userMenuTimer.current)}
 onMouseLeave={() => { userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150); }}
 >
 {/* User info */}
 <div className="flex items-center gap-3 border-b border-rim px-4 py-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-on-gold">
 {user.username?.charAt(0).toUpperCase() ?? 'U'}
 </div>
 <div className="min-w-0">
 <p className="truncate text-sm font-semibold text-ink">{user.username}</p>
 <p className="truncate text-[11px] text-ink-4 capitalize">{user.role?.toLowerCase().replace('_', ' ')}</p>
 </div>
 </div>

 {/* Menu items */}
 <div className="py-1">
 {dashRoute && (
 <Link to={dashRoute}
 className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-2 hover:bg-surface-overlay hover:text-ink transition-colors">
 <LayoutDashboard size={14} className="shrink-0 text-ink-4" /> Dashboard
 </Link>
 )}
 <Link to="/profile"
 className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-2 hover:bg-surface-overlay hover:text-ink transition-colors">
 <User size={14} className="shrink-0 text-ink-4" /> Profile
 </Link>
 </div>

 {/* Logout */}
 <div className="border-t border-rim py-1">
 <button
 className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-fail hover:bg-fail-subtle transition-colors"
 onClick={() => { logout(); navigate('/'); }}>
 <LogOut size={14} className="shrink-0" /> Log Out
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </Container>
 </div>

 {/* Main nav */}
 <div className="py-4 border-b border-on-blue/10">
 <Container className="flex items-center gap-10">
 <Link to="/" aria-label="Royal Derby home">
 <img src="/logopage.png" alt="Royal Derby" className="h-10 object-contain" />
 </Link>

 <nav aria-label="Main" className="hidden lg:block">
 <ul className="flex items-center gap-8">
 {navTrigger('/races', 'Schedule', 'races')}
 {navTrigger('/results', 'Results', 'results')}
 {navTrigger('/jockeys', 'Jockeys', 'jockeys')}
 {navTrigger('/horses', 'Horses', 'horses')}
 <li>
 <Link to="/bet" className={`flex items-center gap-1 px-1 py-1 text-sm font-medium tracking-wide transition-colors ${pathname.startsWith('/bet') ? 'text-on-blue' : 'text-on-blue/75 hover:text-on-blue'}`}>
 <span className={`pb-1 border-b-2 ${pathname.startsWith('/bet') ? 'border-gold' : 'border-transparent'}`}>Bet</span>
 </Link>
 </li>
 </ul>
 </nav>

 <div className="ml-auto flex items-center gap-3">
 {showWallet && (
 <div className="flex items-center gap-2 rounded-md border border-on-blue/20 bg-on-blue/5 px-3 py-1.5">
 <Wallet size={13} className="text-gold" />
 <span className="tnum text-sm font-semibold text-on-blue">
 {balanceLoading ? '...' : fmtBalance(balance)}
 </span>
 <Link to="/my-wallet" aria-label="Deposit funds"
 className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-on-gold transition-colors hover:bg-gold-hi">
 <Plus size={12} strokeWidth={2.5} />
 </Link>
 </div>
 )}

 <button className="flex items-center justify-center border border-on-blue/30 p-2 text-on-blue/70 hover:text-on-blue hover:border-on-blue/60 transition-colors lg:hidden"
 onClick={() => setMenuOpen((p) => !p)}
 aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
 {menuOpen ? <X size={20} /> : <Menu size={20} />}
 </button>
 </div>
 </Container>
 </div>

 {/* Mobile drawer */}
 {menuOpen && (
 <div className="border-t border-on-blue/20 bg-navy lg:hidden">
 <nav className="flex flex-col divide-y divide-on-blue/10">
 {[{ label: 'Schedule', href: '/races' }, { label: 'Results', href: '/results' },
 { label: 'Bet', href: '/bet' }, { label: 'Jockeys', href: '/jockeys' },
 { label: 'Horses', href: '/horses' }].map((item) => (
 <Link key={item.label} to={item.href}
 className={`px-6 py-4 text-sm font-medium transition-colors ${pathname === item.href ? 'text-on-blue' : 'text-on-blue/80 hover:bg-on-blue/10 hover:text-on-blue'}`}
 onClick={() => setMenuOpen(false)}>
 <span className={`pb-1 border-b-2 ${pathname === item.href ? 'border-gold' : 'border-transparent'}`}>{item.label}</span>
 </Link>
 ))}
 </nav>
 <div className="flex gap-3 px-6 py-4 border-t border-on-blue/20">
 {user ? (
 <>
 {dashRoute && <Link to={dashRoute} className="flex-1 bg-on-blue/15 py-2 text-center text-sm font-medium text-on-blue hover:bg-on-blue/25 transition-colors"
 onClick={() => setMenuOpen(false)}>Dashboard</Link>}
 <button className="flex-1 border border-fail/50 py-2 text-center text-sm font-medium text-fail hover:bg-fail/10 transition-colors"
 onClick={() => { logout(); navigate('/'); setMenuOpen(false); }}>Log Out</button>
 </>
 ) : (
 <>
 <Link to="/login" className="flex-1 border border-on-blue/30 py-2 text-center text-sm font-medium text-on-blue/80 hover:bg-on-blue/10 transition-colors" onClick={() => setMenuOpen(false)}>Sign In</Link>
 <Link to="/register" className="flex-1 bg-gold py-2 text-center text-sm font-semibold text-on-gold hover:bg-gold-hi transition-colors" onClick={() => setMenuOpen(false)}>Register</Link>
 </>
 )}
 </div>
 </div>
 )}
 </header>
 );
}