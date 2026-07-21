import axiosInstance from './axiosInstance';
import type { ApiResponse, Notification } from '@/types';

export const getMyNotifications = () =>
 axiosInstance.get<ApiResponse<Notification[]>>('/notifications').then((r) => r.data.data);

export const countUnread = () =>
 axiosInstance.get<ApiResponse<number>>('/notifications/unread-count').then((r) => r.data.data);

export const markAsRead = (id: number) =>
 axiosInstance.put<ApiResponse<null>>(`/notifications/${id}/read`).then((r) => r.data);

export const deleteNotification = (id: number) =>
 axiosInstance.delete<ApiResponse<string>>(`/notifications/${id}`).then((r) => r.data);

export const deleteAllNotifications = () =>
 axiosInstance.delete<ApiResponse<string>>('/notifications').then((r) => r.data);
