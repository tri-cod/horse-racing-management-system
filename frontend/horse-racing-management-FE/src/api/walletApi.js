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

export const getSystemBalance = () =>
  axiosInstance.get('/wallet/balance/system').then((res) => res.data.data);

export const getMyBankAccounts = () =>
  axiosInstance.get('/wallet/bank-accounts').then((res) => res.data.data);
 
export const addBankAccount = (payload) =>
  axiosInstance.post('/wallet/bank-accounts', payload).then((res) => res.data.data);

export const createWithdraw = (payload) =>
  axiosInstance.post('/wallet/withdraw', payload).then((res) => res.data.data);
 
export const getPendingWithdraws = () =>
  axiosInstance.get('/wallet/withdraw/pending').then((res) => res.data.data);
 
export const approveWithdraw = (id, note) =>
  axiosInstance.put(`/wallet/withdraw/${id}/approve`, null, { params: { note } }).then((res) => res.data);
 
export const rejectWithdraw = (id, note) =>
  axiosInstance.put(`/wallet/withdraw/${id}/reject`, null, { params: { note } }).then((res) => res.data);