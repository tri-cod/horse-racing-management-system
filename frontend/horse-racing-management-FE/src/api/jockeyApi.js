import axiosInstance from './axiosInstance';

/**
 * Get the list of active jockeys (public endpoint)
 */
export const getJockeyList = () =>
  axiosInstance.get('/jockeys').then((res) => res.data.data);

/**
 * Get active jockeys that are NOT yet assigned to the given race.
 * Use this (instead of getJockeyList) whenever the user is picking a jockey
 * to register for a specific race, so already-taken jockeys don't show up.
 */
export const getAvailableJockeys = (raceId) =>
  axiosInstance
    .get('/jockeys/available', { params: { raceId } })
    .then((res) => res.data.data);