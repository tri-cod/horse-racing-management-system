import axiosInstance from './axiosInstance';

/** GET /api/wallet/balance */
export const getBalance = () =>
  axiosInstance.get('/wallet/balance').then((res) => res.data.data);

/** POST /api/wallet/deposit */
export const createDeposit = (payload) =>
  axiosInstance.post('/wallet/deposit', payload).then((res) => res.data.data);

/** PUT /api/wallet/deposit/:id/approve (ADMIN only) */
export const approveDeposit = (id, note) =>
  axiosInstance.put(`/wallet/deposit/${id}/approve`, null, { params: { note } }).then((res) => res.data);

/** PUT /api/wallet/deposit/:id/reject (ADMIN only) */
export const rejectDeposit = (id, note) =>
  axiosInstance.put(`/wallet/deposit/${id}/reject`, null, { params: { note } }).then((res) => res.data);

/** GET /api/wallet/deposit/pending (ADMIN only) */
export const getPendingDeposits = () =>
  axiosInstance.get('/wallet/deposit/pending').then((res) => res.data.data);
