import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyNotifications, markAsRead, deleteNotification, deleteAllNotifications } from '@/api/notificationApi';
import { getErrorMessage } from '@/utils/errors';
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

 const handleDelete = async (id: number) => {
 await deleteNotification(id);
 queryClient.setQueryData<Notification[]>(['notifications'], (prev) =>
 prev?.filter((n) => n.id !== id)
 );
 };

 const handleDeleteAll = async () => {
 await deleteAllNotifications();
 queryClient.setQueryData<Notification[]>(['notifications'], []);
 };

 return {
 notifications,
 unreadCount,
 loading: isLoading,
 error: error ? getErrorMessage(error, 'Failed to load notifications.') : null,
 refetch,
 markAsRead: handleMarkAsRead,
 markAllAsRead: handleMarkAllAsRead,
 deleteNotification: handleDelete,
 deleteAllNotifications: handleDeleteAll,
 };
}
