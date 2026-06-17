import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from './NotificationItem';
import LoadingSpinner from './ui/LoadingSpinner';
import '../assets/css/NotificationBell.css';

const PREVIEW_LIMIT = 5;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, unreadCount, loading, markAsRead } = useNotifications({
    pollInterval: 30000,
  });

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  const preview = notifications.slice(0, PREVIEW_LIMIT);

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        type="button"
        className="notif-bell__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleOpen}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <div className={`notif-bell__dropdown${open ? ' open' : ''}`}>
        <div className="notif-bell__header">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="notif-bell__unread-count">{unreadCount} unread</span>
          )}
        </div>

        <div className="notif-bell__list">
          {loading ? (
            <div className="notif-bell__loading">
              <LoadingSpinner size="sm" />
            </div>
          ) : preview.length === 0 ? (
            <div className="notif-bell__empty">
              <p>You're all caught up</p>
              <span>New notifications will show up here</span>
            </div>
          ) : (
            preview.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkAsRead={markAsRead} dense />
            ))
          )}
        </div>

        <button
          type="button"
          className="notif-bell__view-all"
          onClick={() => {
            setOpen(false);
            navigate('/notifications');
          }}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}