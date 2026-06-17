import axiosInstance from './axiosInstance';

/**
 * Get the list of notifications for the current user
 */
export const getMyNotifications = () =>
  axiosInstance.get('/notifications').then((res) => res.data.data);

/**
 * Get the number of unread notifications for the current user
 */
export const getUnreadNotificationCount = () =>
  axiosInstance.get('/notifications/unread-count').then((res) => res.data.data);

/**
 * Mark a single notification as read
 */
export const markNotificationAsRead = (id) =>
  axiosInstance.put(`/notifications/${id}/read`).then((res) => res.data.data);