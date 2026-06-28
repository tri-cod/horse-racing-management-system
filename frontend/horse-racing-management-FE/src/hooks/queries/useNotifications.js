import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markAsRead } from '../../api/notificationApi';

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getMyNotifications().then((data) => data ?? []),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      queryClient.setQueryData(['notifications'], (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silent
    }
  }, [queryClient]);

  const handleMarkAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.allSettled(unread.map((n) => markAsRead(n.id)));
    queryClient.setQueryData(['notifications'], (old) =>
      old?.map((n) => ({ ...n, isRead: true }))
    );
  }, [notifications, queryClient]);

  return {
    notifications,
    unreadCount,
    loading: query.isLoading,
    error: query.error ? 'Failed to load notifications.' : null,
    refetch: query.refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
}
