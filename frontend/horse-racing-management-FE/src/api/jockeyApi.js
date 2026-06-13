import axiosInstance from './axiosInstance';

/**
 * Get the list of active jockeys (public endpoint)
 */
export const getJockeyList = () =>
  axiosInstance.get('/jockeys').then((res) => res.data.data);
