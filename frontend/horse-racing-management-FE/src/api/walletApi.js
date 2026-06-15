import axiosInstance from './axiosInstance';

export const getBalance = () =>
  axiosInstance.get('/wallet/balance').then((res) => res.data.data);

export const createDeposit = (payload) =>
  axiosInstance.post('/wallet/deposit', payload).then((res) => res.data.data);

export const getPendingDeposits = () =>
  axiosInstance.get('/wallet/deposit/pending').then((res) => res.data.data);

export const approveDeposit = (id, note) =>
  axiosInstance.put(`/wallet/deposit/${id}/approve`, null, { params: { note } }).then((res) => res.data);

export const rejectDeposit = (id, note) =>
  axiosInstance.put(`/wallet/deposit/${id}/reject`, null, { params: { note } }).then((res) => res.data);
