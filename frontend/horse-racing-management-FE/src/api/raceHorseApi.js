import axiosInstance from './axiosInstance';

export const registerHorseToRace = ({ raceId, horseId, jockeyId }) =>
  axiosInstance.post('/race-horse/register', { raceId, horseId, jockeyId }).then((res) => res.data.data);

export const getHorsesByRace = (raceId) =>
  axiosInstance.get(`/race-horse/race/${raceId}`).then((res) => res.data.data);

export const getMyRaceRegistrations = () =>
  axiosInstance.get('/race-horse/my-races').then((res) => res.data.data);

export const getPendingHorses = () =>
  axiosInstance.get('/race-horse/pending').then((res) => res.data.data);

export const approveRaceHorse = (id) =>
  axiosInstance.put(`/race-horse/${id}/approve`).then((res) => res.data.data);

export const rejectRaceHorse = (id) =>
  axiosInstance.put(`/race-horse/${id}/reject`).then((res) => res.data.data);

export const setOdds = (payload) =>
  axiosInstance.put('/race-horse/odds', payload).then((res) => res.data);

export const setOddsForOne = (id, odds) =>
  axiosInstance.put(`/race-horse/${id}/odds`, null, { params: { odds } }).then((res) => res.data.data);