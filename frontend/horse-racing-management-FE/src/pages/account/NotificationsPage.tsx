import { useState } from 'react';
import { Bell, Trophy, Target, CheckCircle, Wallet, Info, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Notification } from '@/types';

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7
    ? `${days}d ago`
    : new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function notifAccent(type?: string) {
  const t = type?.toUpperCase() ?? '';
  if (t.includes('RACE') || t.includes('RESULT')) return 'bg-navy text-on-blue';
  if (t.includes('BET'))                           return 'bg-gold/15 text-gold';
  if (t.includes('REGISTR'))                       return 'bg-ok-subtle text-ok';
  if (t.includes('WALLET') || t.includes('PAYMENT') || t.includes('DEPOSIT')) return 'bg-navy/10 text-navy';
  return 'bg-surface-overlay text-ink-3';
}

function NotifIcon({ type }: { type?: string }) {
  const t = type?.toUpperCase() ?? '';
  if (t.includes('RACE') || t.includes('RESULT')) return <Trophy size={16} />;
  if (t.includes('BET'))                           return <Target size={16} />;
  if (t.includes('REGISTR'))                       return <CheckCircle size={16} />;
  if (t.includes('WALLET') || t.includes('PAYMENT') || t.includes('DEPOSIT')) return <Wallet size={16} />;
  return <Info size={16} />;
}

function NotifSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <div className="h-10 w-10 animate-pulse shrink-0 bg-surface-overlay" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-48 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-full max-w-sm animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-2.5 w-16 animate-pulse rounded-full bg-surface-overlay" />
          </div>
          <div className="h-4 w-4 animate-pulse shrink-0 bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

function NotifItem({ notif, onMarkRead }: { notif: Notification; onMarkRead: (id: number) => void }) {
  return (
    <div className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-overlay/60 ${
      !notif.isRead ? 'border-l-2 border-navy' : 'border-l-2 border-transparent'
    }`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center ${notifAccent(notif.type)}`}>
        <NotifIcon type={notif.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${notif.isRead ? 'text-ink-2' : 'text-ink'}`}>
          {notif.title ?? 'Notification'}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-ink-3">{notif.content ?? notif.message}</p>
        <span className="mt-1 block text-xs text-ink-4">{timeAgo(notif.createdAt)}</span>
      </div>
      <div className="shrink-0 pt-0.5">
        {!notif.isRead ? (
          <button
            type="button"
            title="Mark as read"
            onClick={() => onMarkRead(notif.id)}
            className="text-ink-4 transition-colors hover:text-navy"
          >
            <CheckCheck size={16} />
          </button>
        ) : (
          <span className="block h-4 w-4" />
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useNotifications();
  const list = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="px-8 py-6">
      <Seo title="Notifications" description="Your Royal Derby notifications." />
      <DashboardPageHeader
        eyebrow="Account"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        action={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 border border-rim-hi px-3 py-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay hover:text-ink"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          ) : undefined
        }
      />

      <div className="mx-auto max-w-3xl">
        {/* Tabs */}
        <div className="mb-5 flex items-center border-b border-rim">
          {(['all', 'unread'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'border-navy text-navy' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {t}
              {t === 'all' && notifications.length > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-overlay px-1 text-[10px] font-bold text-ink-3">
                  {notifications.length}
                </span>
              )}
              {t === 'unread' && unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1 text-[10px] font-bold text-on-blue">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</div>
        )}

        {loading ? (
          <NotifSkeleton />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={tab === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            subtitle={tab === 'unread' ? 'No unread notifications.' : 'Race alerts and results will appear here.'}
          />
        ) : (
          <div className="overflow-hidden border border-rim bg-surface-raised divide-y divide-rim">
            {list.map((n) => (
              <NotifItem key={n.id} notif={n} onMarkRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
