import axiosInstance from './axiosInstance';

/**
 * Get the current trainer's profile
 */
export const getTrainerProfile = () =>
  axiosInstance.get('/trainer/profile').then((res) => res.data.data);

/**
 * Complete or update trainer profile
 */
export const completeTrainerProfile = (payload) =>
  axiosInstance.put('/trainer/complete-profile', payload).then((res) => res.data.data);