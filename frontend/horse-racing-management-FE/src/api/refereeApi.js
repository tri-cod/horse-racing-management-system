import axiosInstance from './axiosInstance';

export const startRace = (id) =>
  axiosInstance.put(`/races/${id}/start`).then((res) => res.data.data);

export const finishRace = (id) =>
  axiosInstance.put(`/races/${id}/finish`).then((res) => res.data.data);

export const getAllRaces = ({ status, page = 0, size = 100 } = {}) => {
  const params = { page, size };
  if (status) params.status = status;
  return axiosInstance.get('/races/list', { params }).then((res) => res.data.data);
};

export const getHorsesByRace = (raceId) =>
  axiosInstance.get(`/race-horse/race/${raceId}`).then((res) => res.data.data);

export const setRaceResult = (request) =>
  axiosInstance.post('/race-results', request).then((res) => res.data);

export const getRaceResults = (raceId) =>
  axiosInstance.get(`/race-results/race/${raceId}`).then((res) => res.data.data);

// Use PUT /races/update/{id} with full current race data,
// only changing status to CLOSED_REGISTRATION
export const closeRegistration = (race) => {
  const payload = {
    raceName: race.raceName,
    startTime: race.startTime,
    endTime: race.endTime,
    trackName: race.trackName,
    trackCondition: race.trackCondition,
    surfaceType: race.surfaceType,
    totalprizepool: race.totalprizepool,
    distance: race.distance,
    location: race.location,
    capacity: race.capacity,
    bannerImageurl: race.bannerImageurl,
    registrationDeadline: race.registrationDeadline,
    refereeId: race.refereeId ?? null,
    status: 'CLOSED_REGISTRATION',
  };
  return axiosInstance.put(`/races/update/${race.id}`, payload).then((res) => res.data.data);
};