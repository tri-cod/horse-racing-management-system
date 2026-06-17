import { useMemo, useState } from 'react';
import { BellOff } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/NotificationItem';
import PageHero from '../components/ui/PageHero';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import '../assets/css/NotificationsPage.css';

const FILTER_TABS = ['All', 'Unread'];

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, refetch, markAsRead, markAllAsRead } =
    useNotifications();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = useMemo(() => {
    if (activeTab === 'Unread') return notifications.filter((n) => !n.isRead);
    return notifications;
  }, [notifications, activeTab]);

  return (
    <div className="notif-page">
      <PageHero
        eyebrow="MY ACTIVITY"
        title="Notifications"
        subtitle="Stay up to date with races, registrations and results"
      />

      <div className="notif-page__content">
        <div className="notif-page__toolbar">
          <div className="notif-page__tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`notif-page__tab${activeTab === tab ? ' notif-page__tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === 'Unread' && unreadCount > 0 && (
                  <span className="notif-page__tab-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button type="button" className="notif-page__mark-all" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="notif-page__error">
            <span>{error}</span>
            <button type="button" onClick={refetch}>Try again</button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title={activeTab === 'Unread' ? 'No unread notifications' : 'No notifications yet'}
            subtitle={
              activeTab === 'All'
                ? 'Updates about your races, registrations and results will appear here.'
                : undefined
            }
          />
        ) : (
          <div className="notif-page__list">
            {filtered.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}