// Module: Race Horse — API layer
// All responses follow the wrapper: { status, message, data }
// Usage in hooks: const res = await fn(); const items = res.data;
import axiosInstance from './axiosInstance';

// POST /race-horse/register — HORSE_OWNER — register a horse to a race
export const registerHorseToRace = (payload) =>
  axiosInstance.post('/race-horse/register', payload).then((res) => res.data);

// GET /race-horse/race/{raceId} — Public — list all registrations for a race
export const getRaceHorseList = (raceId) =>
  axiosInstance.get(`/race-horse/race/${raceId}`).then((res) => res.data);

// GET /race-horse/my-races — HORSE_OWNER — my registered races
export const getMyHorseRaces = () =>
  axiosInstance.get('/race-horse/my-races').then((res) => res.data);

// PUT /race-horse/{id}/approve — ADMIN — approve a registration
export const approveRaceHorse = (id) =>
  axiosInstance.put(`/race-horse/${id}/approve`).then((res) => res.data);

// PUT /race-horse/{id}/reject — ADMIN — reject a registration
export const rejectRaceHorse = (id) =>
  axiosInstance.put(`/race-horse/${id}/reject`).then((res) => res.data);

// GET /jockeys — Public — jockey list for dropdown
export const getJockeyList = () =>
  axiosInstance.get('/jockeys').then((res) => res.data);

// GET /horse-owner/horses — HORSE_OWNER — owner's horse list for dropdown
export const getMyHorseList = () =>
  axiosInstance.get('/horse-owner/horses').then((res) => res.data);

// GET /races?status=UPCOMING — Public — upcoming races for register form
export const getUpcomingRaces = () =>
  axiosInstance.get('/races', { params: { status: 'UPCOMING' } }).then((res) => res.data);

// GET /races — Public — all races (no status filter) for admin selector
export const getAllRaces = (params) =>
  axiosInstance.get('/races', { params }).then((res) => res.data);
