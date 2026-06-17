import { useCallback, useEffect, useState } from 'react';
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from '../api/notificationApi';

export function useNotifications({ pollInterval = 0 } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyNotifications();
      // normalize: backend trả về "read", map về "isRead" cho nhất quán
      const normalized = (data || []).map((n) => ({
        ...n,
        isRead: n.isRead ?? n.read ?? false,
      }));
      setNotifications(normalized);
      // tính unreadCount từ data luôn cho chính xác
      setUnreadCount(normalized.filter((n) => !n.isRead).length);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count || 0);
    } catch {
      // silent
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update this notification.');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update notifications.');
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (pollInterval <= 0) return undefined;
    const id = setInterval(fetchUnreadCount, pollInterval);
    return () => clearInterval(id);
  }, [pollInterval, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}