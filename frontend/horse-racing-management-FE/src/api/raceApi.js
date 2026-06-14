import axiosInstance from './axiosInstance';

export const createRace = (payload) =>
  axiosInstance.post('/races/create', payload).then((res) => res.data.data);

export const getRaceById = (id) =>
  axiosInstance.get(`/races/${id}`).then((res) => res.data.data);

export const getRaces = ({ status, page = 0, size = 10 } = {}) => {
  const params = { page, size };
  if (status) params.status = status;
  return axiosInstance.get('/races', { params }).then((res) => res.data.data);
};

export const updateRace = (id, payload) =>
  axiosInstance.put(`/races/update/${id}`, payload).then((res) => res.data.data);

export const deleteRace = (id) =>
  axiosInstance.delete(`/races/${id}`).then((res) => res.data.data);

export const startRace = (id) =>
  axiosInstance.put(`/races/${id}/start`).then((res) => res.data.data);

export const finishRace = (id) =>
  axiosInstance.put(`/races/${id}/finish`).then((res) => res.data.data);
