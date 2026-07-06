import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markAsRead } from '@/api/notificationApi';
import type { Notification } from '@/types';

export function useNotifications() {
 const queryClient = useQueryClient();

 const { data, isLoading, error, refetch } = useQuery<Notification[]>({
 queryKey: ['notifications'],
 queryFn: getMyNotifications,
 });

 const notifications = data ?? [];
 const unreadCount = notifications.filter((n) => !n.isRead).length;

 const handleMarkAsRead = async (id: number) => {
 await markAsRead(id);
 queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
 prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
 );
 };

 const handleMarkAllAsRead = async () => {
 const unread = notifications.filter((n) => !n.isRead);
 await Promise.allSettled(unread.map((n) => markAsRead(n.id)));
 queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
 prev?.map((n) => ({ ...n, isRead: true }))
 );
 };

 return {
 notifications,
 unreadCount,
 loading: isLoading,
 error: error ? 'Failed to load notifications.' : null,
 refetch,
 markAsRead: handleMarkAsRead,
 markAllAsRead: handleMarkAllAsRead,
 };
}
