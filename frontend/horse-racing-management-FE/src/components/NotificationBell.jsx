import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Trophy, Target, CheckCircle, Wallet, Info } from 'lucide-react';
import { getMyNotifications, countUnread, markAsRead } from '../api/notificationApi';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../assets/css/NotificationBell.css';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotifIcon({ type }) {
  const t = type?.toUpperCase() ?? '';
  if (t.includes('RACE') || t.includes('RESULT')) return <Trophy size={15} />;
  if (t.includes('BET')) return <Target size={15} />;
  if (t.includes('REGISTR')) return <CheckCircle size={15} />;
  if (t.includes('WALLET') || t.includes('PAYMENT') || t.includes('DEPOSIT') || t.includes('WITHDRAW')) return <Wallet size={15} />;
  return <Info size={15} />;
}

function getNotifRoute(notif, userRole) {
  const title = (notif.title ?? '').toLowerCase();
  const type  = (notif.type  ?? '').toLowerCase();
  const isAdmin = ['ADMIN', 'STAFF'].includes(userRole);

  // Admin nhận request mới → trang quản lý
  if (isAdmin && title.includes('withdraw')) {
    return '/admin/deposits?tab=withdraw';
  }
  if (isAdmin && title.includes('deposit')) {
    return '/admin/deposits?tab=deposit';
  }
  // User nhận kết quả withdraw/deposit → trang wallet
  if (!isAdmin && (title.includes('withdraw') || title.includes('deposit'))) {
    return '/my-wallet';
  }
  // Race result, bet → trang race cụ thể
  if (notif.referenceId && (title.includes('race') || title.includes('bet') || title.includes('result') || type.includes('race'))) {
    return `/races/${notif.referenceId}`;
  }
  // Mặc định → trang notifications
  return '/notifications';
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const hasFetched = useRef(false);
  const closeTimer = useRef(null);

  // Poll unread count every 30s
  const fetchCount = useCallback(async () => {
    try {
      const count = await countUnread();
      setUnreadCount(count ?? 0);
    } catch {
      // silent — non-blocking background poll
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, 30_000);
    return () => clearInterval(id);
  }, [fetchCount]);

  // Lazy-load notification list on first hover
  useEffect(() => {
    if (!open || hasFetched.current) return;
    hasFetched.current = true;
    setLoadingList(true);
    getMyNotifications()
      .then((data) => setNotifications(data?.slice(0, 5) ?? []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [open]);

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    navigate(getNotifRoute(notif, user?.role));
  };

  return (
    <div className="notif-bell" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className={`notif-bell__btn${open ? ' notif-bell__btn--active' : ''}`}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="notif-bell__badge" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <div className={`notif-bell__dropdown${open ? ' open' : ''}`} role="menu">
        <div className="notif-bell__dropdown-header">
          <span className="notif-bell__dropdown-title">Notifications</span>
          <Link
            to="/notifications"
            className="notif-bell__view-all"
              >
            View all
          </Link>
        </div>

        <div className="notif-bell__list">
          {loadingList ? (
            <div className="notif-bell__empty">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="notif-bell__empty">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                className={`notif-bell__item${!n.isRead ? ' notif-bell__item--unread' : ''}`}
                onClick={() => handleItemClick(n)}
              >
                <span className="notif-bell__item-icon">
                  <NotifIcon type={n.type} />
                </span>
                <span className="notif-bell__item-body">
                  <span className="notif-bell__item-title">{n.title ?? 'Notification'}</span>
                  <span className="notif-bell__item-content">{n.content}</span>
                  <span className="notif-bell__item-time">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.isRead && <span className="notif-bell__item-dot" aria-label="Unread" />}
              </button>
            ))
          )}
        </div>

        <div className="notif-bell__dropdown-footer">
          <Link
            to="/notifications"
            className="notif-bell__footer-link"
          >
            See all notifications
          </Link>
        </div>
      </div>
    </div>
  );
}