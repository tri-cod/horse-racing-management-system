import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Trophy, Target, CheckCircle, Wallet, Info, ArrowRight } from 'lucide-react';
import { getMyNotifications, countUnread, markAsRead } from '@/api/notificationApi';
import { useAuth } from '@/context/AuthContext';
import type { Notification, UserRole } from '@/types';

// These notification types carry a RaceHorse id as `referenceId`, not a Race id
// (see backend RaceHorseServiceImpl — sendJockeyRequest/jockeyAccept/jockeyDecline/
// approveHorse/rejectHorse/requestWithdrawal/approveWithdrawal/rejectWithdrawal all
// pass raceHorse.getId()). Linking to /races/{referenceId} for these would 500 or
// land on an unrelated race, so route to the relevant list page per role instead.
const RACE_HORSE_ENTITY_TYPES = new Set(['RACE_REGISTRATION', 'RACE_APPROVED', 'RACE_REJECTED', 'RACE_WITHDRAWAL']);

function resolveNotificationPath(notif: Notification, role?: UserRole): string {
  const type = notif.type ?? '';
  if (RACE_HORSE_ENTITY_TYPES.has(type)) {
    if (role === 'JOCKEY') return '/jockey/race-requests';
    if (role === 'HORSE_OWNER') return '/horse-owner/race-registrations';
    if (role === 'ADMIN') return type === 'RACE_WITHDRAWAL' ? '/admin/withdrawal-requests' : '/admin/races';
    return '/notifications';
  }
  // Other types (RACE_CREATED, RACE_STARTED, RACE_RESULT_PUBLISHED, ...) carry a real race id.
  return notif.referenceId ? `/races/${notif.referenceId}` : '/notifications';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string): string {
 if (!dateStr) return '';
 const diff = Date.now() - new Date(dateStr).getTime();
 const mins = Math.floor(diff / 60000);
 if (mins < 1) return 'Just now';
 if (mins < 60) return`${mins}m ago`;
 const hours = Math.floor(mins / 60);
 if (hours < 24) return`${hours}h ago`;
 return`${Math.floor(hours / 24)}d ago`;
}

function NotifIcon({ type }: { type?: string }) {
 const t = type?.toUpperCase() ?? '';
 if (t.includes('RACE') || t.includes('RESULT')) return <Trophy size={15} />;
 if (t.includes('BET')) return <Target size={15} />;
 if (t.includes('REGISTR')) return <CheckCircle size={15} />;
 if (t.includes('WALLET') || t.includes('PAYMENT') || t.includes('DEPOSIT')) return <Wallet size={15} />;
 return <Info size={15} />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NotificationBell() {
 const { user } = useAuth();
 const [open, setOpen] = useState(false);
 const [unreadCount, setUnreadCount] = useState(0);
 const [notifications, setNotifications] = useState<Notification[]>([]);
 const [loadingList, setLoadingList] = useState(false);
 const navigate = useNavigate();
 const hasFetched = useRef(false);
 const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

 // Poll unread count every 30s
 const fetchCount = useCallback(async () => {
 try {
 const count = await countUnread();
 setUnreadCount(count ?? 0);
 } catch { /* silent background poll */ }
 }, []);

 useEffect(() => {
 fetchCount();
 const id = setInterval(fetchCount, 30_000);
 return () => clearInterval(id);
 }, [fetchCount]);

 // Lazy-load list on first open
 useEffect(() => {
 if (!open || hasFetched.current) return;
 hasFetched.current = true;
 setLoadingList(true);
 getMyNotifications()
 .then((data) => setNotifications(data?.slice(0, 5) ?? []))
 .catch(() => {})
 .finally(() => setLoadingList(false));
 }, [open]);

 const handleMouseEnter = () => { clearTimeout(closeTimer.current); setOpen(true); };
 const handleMouseLeave = () => { closeTimer.current = setTimeout(() => setOpen(false), 150); };

 const handleItemClick = async (notif: Notification) => {
 if (!notif.isRead) {
 markAsRead(notif.id).catch(() => {});
 setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, isRead: true } : n));
 setUnreadCount((c) => Math.max(0, c - 1));
 }
 setOpen(false);
 navigate(resolveNotificationPath(notif, user?.role));
 };

 return (
 <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
 <button
 type="button"
 className="relative flex items-center justify-center w-8 h-8 text-ink-3 hover:text-ink hover:bg-surface-overlay transition-colors"
 aria-label={`Notifications${unreadCount > 0 ?` (${unreadCount} unread)` : ''}`}
 aria-expanded={open}
 >
 <Bell size={17} />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-none text-on-gold" aria-hidden="true">
 {unreadCount > 99 ? '99+' : unreadCount}
 </span>
 )}
 </button>

 {open && (
 <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden border border-rim bg-surface-raised shadow-2xl shadow-black/60">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-rim px-4 py-3">
 <span className="text-sm font-semibold text-ink">Notifications</span>
 <Link to="/notifications" className="text-xs font-medium text-gold hover:text-gold-hi transition-colors">
 View all
 </Link>
 </div>

 {/* List */}
 <div className="max-h-80 overflow-y-auto">
 {loadingList ? (
 <div className="flex items-center justify-center py-10 text-sm text-ink-4">Loading…</div>
 ) : notifications.length === 0 ? (
 <div className="flex items-center justify-center py-10 text-sm text-ink-4">No notifications yet.</div>
 ) : (
 notifications.map((n) => (
 <button
 key={n.id}
 type="button"
 className={`group w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-overlay ${!n.isRead ? 'bg-gold/5' : ''}`}
 onClick={() => handleItemClick(n)}
 >
 {/* Icon */}
 <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${!n.isRead ? 'bg-gold/15 text-gold' : 'bg-surface-input text-ink-4'}`}>
 <NotifIcon type={n.type} />
 </span>

 {/* Text */}
 <span className="min-w-0 flex-1">
 <span className="block truncate text-xs font-semibold text-ink">
 {n.title ?? 'Notification'}
 </span>
 <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-ink-3">
 {n.content ?? n.message}
 </span>
 <span className="mt-1 block text-[11px] text-ink-4">
 {timeAgo(n.createdAt)}
 </span>
 </span>

 {/* Unread dot */}
 {!n.isRead && (
 <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" aria-label="Unread" />
 )}
 </button>
 ))
 )}
 </div>

 {/* Footer */}
 <div className="border-t border-rim px-4 py-3">
 <Link to="/notifications"
 className="flex items-center justify-center gap-1.5 text-xs font-medium text-gold hover:text-gold-hi transition-colors">
 See all notifications <ArrowRight size={12} />
 </Link>
 </div>
 </div>
 )}
 </div>
 );
}
