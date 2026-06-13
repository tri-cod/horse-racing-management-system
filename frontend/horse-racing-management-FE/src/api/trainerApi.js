import axiosInstance from './axiosInstance';

export const getTrainerProfile = () =>
  axiosInstance.get('/trainer/profile').then((res) => res.data.data);

export const completeTrainerProfile = (payload) =>
  axiosInstance.put('/trainer/complete-profile', payload).then((res) => res.data.data);

export const getTrainerList = () =>
  axiosInstance.get('/trainer/list').then((res) => res.data.data);
