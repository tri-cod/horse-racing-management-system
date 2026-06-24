import axiosInstance from './axiosInstance';

/**
 * Register a new horse for the current horse owner
 */
export const signHorse = (payload) =>
  axiosInstance.post('/horse-owner/horses', payload).then((res) => res.data.data);

/**
 * Upload an avatar image and return its URL.
 * Backend must expose an endpoint to accept multipart file uploads and return the stored image URL.
 */
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance
    .post('/horse-owner/horses/avatar', formData)
    .then((res) => res.data.data?.avatarUrl || res.data.data);
};

/**
 * Get the list of horses owned by the current horse owner
 */
export const getMyHorses = () =>
  axiosInstance.get('/horse-owner/horses').then((res) => res.data.data);

/**
 * Get the current horse owner's horses that are NOT yet registered in any
 * race (pending or approved). Use this (instead of getMyHorses) when the
 * user is picking a horse to register for a race, so horses already racing
 * elsewhere don't show up as selectable.
 */
export const getAvailableHorses = () =>
  axiosInstance.get('/horse-owner/horses/available').then((res) => res.data.data);
/**
 * Get a single horse's detail by id
 */
export const getHorseById = (horseId) =>
  axiosInstance.get(`/horse-owner/horses/${horseId}`).then((res) => res.data.data);

/**
 * Assign a trainer to a horse (trainerId is sent as a query param)
 */
export const assignTrainer = (horseId, trainerId) =>
  axiosInstance
    .put(`/horse-owner/horses/${horseId}/assign-trainer`, null, { params: { trainerId } })
    .then((res) => res.data.data);
