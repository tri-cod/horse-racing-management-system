import { useNavigate } from 'react-router-dom';
import Badge from './ui/Badge';
import {
  getNotificationTypeLabel,
  getNotificationTypeIcon,
  getNotificationTypeVariant,
  getNotificationLink,
} from '../utils/notificationType';
import '../assets/css/NotificationItem.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationItem({ notification, onMarkAsRead, dense = false }) {
  const navigate = useNavigate();
  const { id, title, content, type, isRead, createdAt } = notification;
  const Icon = getNotificationTypeIcon(type);

  const handleClick = () => {
    if (!isRead) onMarkAsRead?.(id);
    const link = getNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <button
      type="button"
      className={`notif-item${dense ? ' notif-item--dense' : ''}${!isRead ? ' notif-item--unread' : ''}`}
      onClick={handleClick}
    >
      <span className="notif-item__icon">
        <Icon size={dense ? 16 : 18} />
      </span>

      <span className="notif-item__body">
        <span className="notif-item__top">
          <span className="notif-item__title">{title}</span>
          {!isRead && <span className="notif-item__dot" aria-label="Unread" />}
        </span>
        {content && <span className="notif-item__content">{content}</span>}
        <span className="notif-item__meta">
          <Badge variant={getNotificationTypeVariant(type)} size="sm">
            {getNotificationTypeLabel(type)}
          </Badge>
          <span className="notif-item__time">{formatDate(createdAt)}</span>
        </span>
      </span>
    </button>
  );
}