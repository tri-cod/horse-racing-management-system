import axiosInstance from './axiosInstance';

export const getRaceResultsByRaceId = (raceId) =>
  axiosInstance
    .get(`/race-results/race/${raceId}`)
    .then((res) => res.data.data);