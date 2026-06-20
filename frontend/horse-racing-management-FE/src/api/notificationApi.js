import axiosInstance from './axiosInstance';

export const getMyNotifications = () =>
  axiosInstance.get('/notifications').then((res) => res.data.data);

export const countUnread = () =>
  axiosInstance.get('/notifications/unread-count').then((res) => res.data.data);

export const markAsRead = (id) =>
  axiosInstance.put(`/notifications/${id}/read`).then((res) => res.data);
