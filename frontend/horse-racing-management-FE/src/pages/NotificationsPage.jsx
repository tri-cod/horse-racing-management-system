import { useState } from 'react';
import { Bell, Trophy, Target, CheckCircle, Wallet, Info, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import '../assets/css/NotificationsPage.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function NotifIcon({ type }) {
  const t = type?.toUpperCase() ?? '';
  if (t.includes('RACE') || t.includes('RESULT')) return <Trophy size={17} />;
  if (t.includes('BET')) return <Target size={17} />;
  if (t.includes('REGISTR')) return <CheckCircle size={17} />;
  if (t.includes('WALLET') || t.includes('PAYMENT') || t.includes('DEPOSIT')) return <Wallet size={17} />;
  return <Info size={17} />;
}

function NotificationItem({ notif, onMarkRead }) {
  return (
    <div className={`notif-item${notif.isRead ? '' : ' notif-item--unread'}`}>
      <div className="notif-item__icon">
        <NotifIcon type={notif.type} />
      </div>

      <div className="notif-item__body">
        <p className="notif-item__title">{notif.title ?? 'Notification'}</p>
        <p className="notif-item__content">{notif.content}</p>
        <span className="notif-item__time">{timeAgo(notif.createdAt)}</span>
      </div>

      <div className="notif-item__actions">
        {!notif.isRead ? (
          <button
            type="button"
            className="notif-item__mark-btn"
            title="Mark as read"
            onClick={() => onMarkRead(notif.id)}
          >
            <CheckCheck size={14} />
          </button>
        ) : (
          <span className="notif-item__read-dot--done" />
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [tab, setTab] = useState('all');
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const list = tab === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="notif-page">
<div className="notif-page__content">
        {/* Toolbar */}
        <div className="notif-page__toolbar">
          <div className="notif-page__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'all'}
              className={`notif-page__tab${tab === 'all' ? ' notif-page__tab--active' : ''}`}
              onClick={() => setTab('all')}
            >
              All
              {notifications.length > 0 && (
                <span className="notif-page__tab-count">{notifications.length}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'unread'}
              className={`notif-page__tab${tab === 'unread' ? ' notif-page__tab--active' : ''}`}
              onClick={() => setTab('unread')}
            >
              Unread
              {unreadCount > 0 && (
                <span className="notif-page__tab-count">{unreadCount}</span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notif-page__mark-all"
              onClick={markAllAsRead}
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Error */}
        {error && <div className="notif-page__error">{error}</div>}

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="md" />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={tab === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            subtitle={
              tab === 'unread'
                ? 'No unread notifications at the moment.'
                : 'Notifications about races, results, and your account will appear here.'
            }
          />
        ) : (
          <div className="notif-page__list" role="list">
            {list.map((n) => (
              <NotificationItem key={n.id} notif={n} onMarkRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
