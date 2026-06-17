import {
  Flag,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PlayCircle,
  Trophy,
  Bell,
} from 'lucide-react';

const TYPE_LABELS = {
  RACE_REGISTRATION: 'Race Registration',
  RACE_APPROVED: 'Registration Approved',
  RACE_REJECTED: 'Registration Rejected',
  RACE_CREATED: 'New Race',
  RACE_UPDATED: 'Race Updated',
  RACE_CANCELLED: 'Race Cancelled',
  RACE_STARTED: 'Race Started',
  RACE_FINISHED: 'Race Finished',
  RACE_RESULT_PUBLISHED: 'Race Results',
  SYSTEM: 'System',
};

const TYPE_ICONS = {
  RACE_REGISTRATION: Flag,
  RACE_APPROVED: CheckCircle2,
  RACE_REJECTED: XCircle,
  RACE_CREATED: Flag,
  RACE_UPDATED: RefreshCw,
  RACE_CANCELLED: XCircle,
  RACE_STARTED: PlayCircle,
  RACE_FINISHED: Flag,
  RACE_RESULT_PUBLISHED: Trophy,
  SYSTEM: Bell,
};

const TYPE_VARIANTS = {
  RACE_APPROVED: 'ocean',
  RACE_RESULT_PUBLISHED: 'ocean',
  RACE_FINISHED: 'ocean',
  RACE_STARTED: 'ocean-solid',
  RACE_REJECTED: 'danger',
  RACE_CANCELLED: 'danger',
};

// Types whose referenceId points to a Race id, so the user can jump to /races/:id
const RACE_LINKED_TYPES = [
  'RACE_CREATED',
  'RACE_UPDATED',
  'RACE_CANCELLED',
  'RACE_STARTED',
  'RACE_FINISHED',
  'RACE_RESULT_PUBLISHED',
];

export function getNotificationTypeLabel(type) {
  return TYPE_LABELS[type] || 'Notification';
}

export function getNotificationTypeIcon(type) {
  return TYPE_ICONS[type] || Bell;
}

export function getNotificationTypeVariant(type) {
  return TYPE_VARIANTS[type] || 'neutral';
}

/**
 * Resolve the in-app link a notification should navigate to, if any.
 */
export function getNotificationLink(notification) {
  if (!notification?.referenceId) return null;
  if (RACE_LINKED_TYPES.includes(notification.type)) {
    return `/races/${notification.referenceId}`;
  }
  return null;
}