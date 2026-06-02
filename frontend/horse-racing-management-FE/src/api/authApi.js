import axiosInstance from './axiosInstance';

export const register = (payload) =>
  axiosInstance.post('/auth/register', payload).then((res) => res.data);

export const login = (payload) =>
  axiosInstance.post('/auth/login', payload).then((res) => res.data);
