import axiosInstance from './axiosInstance';

/**
 * Register a new horse for the current horse owner
 */
export const signHorse = (payload) =>
  axiosInstance.post('/horse-owner/horses', payload).then((res) => res.data.data);

/**
 * Get the list of horses owned by the current horse owner
 */
export const getMyHorses = () =>
  axiosInstance.get('/horse-owner/horses').then((res) => res.data.data);

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
