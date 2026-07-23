import axiosInstance from './axiosInstance';
import type {
 ApiResponse, RaceHorse, RegisterHorseToRacePayload, SetOddsPayload,
 SendJockeyRequestPayload, WithdrawRaceHorsePayload, HorseEligibility,
} from '@/types';

export const registerHorseToRace = (payload: RegisterHorseToRacePayload) =>
 axiosInstance
 .post<ApiResponse<RaceHorse>>('/race-horse/register', payload)
 .then((r) => r.data.data);

// Preview whether a horse meets a race's age/gender/class/earnings/weight requirements
// before actually registering — registerHorseToRace() now enforces the same check server-side.
export const checkHorseEligibility = (raceId: number, horseId: number) =>
 axiosInstance
 .get<ApiResponse<HorseEligibility>>('/race-horse/eligibility', { params: { raceId, horseId } })
 .then((r) => r.data.data);

export const getHorsesByRace = (raceId: number) =>
 axiosInstance
 .get<ApiResponse<RaceHorse[]>>(`/race-horse/race/${raceId}`)
 .then((r) => r.data.data);

export const getMyRaceRegistrations = () =>
 axiosInstance.get<ApiResponse<RaceHorse[]>>('/race-horse/my-races').then((r) => r.data.data);

export const getPendingHorses = () =>
 axiosInstance.get<ApiResponse<RaceHorse[]>>('/race-horse/pending').then((r) => r.data.data);

export const approveRaceHorse = (id: number) =>
 axiosInstance.put<ApiResponse<RaceHorse>>(`/race-horse/${id}/approve`).then((r) => r.data.data);

export const rejectRaceHorse = (id: number) =>
 axiosInstance.put<ApiResponse<RaceHorse>>(`/race-horse/${id}/reject`).then((r) => r.data.data);

export const setOdds = (raceId: number, oddsList: SetOddsPayload[]) =>
  axiosInstance.put<ApiResponse<null>>('/race-horse/odds', { raceId, oddsList }).then((r) => r.data);

export const setOddsForOne = (id: number, odds: number) =>
 axiosInstance
 .put<ApiResponse<RaceHorse>>(`/race-horse/${id}/odds`, null, { params: { odds } })
 .then((r) => r.data.data);

// ── Jockey assignment (Horse Owner invites, Jockey accepts/declines) ──────────
export const sendJockeyRequest = (payload: SendJockeyRequestPayload) =>
 axiosInstance
 .post<ApiResponse<RaceHorse>>('/race-horse/jockey-request', payload)
 .then((r) => r.data.data);

export const getJockeyRequests = () =>
 axiosInstance.get<ApiResponse<RaceHorse[]>>('/race-horse/jockey-requests').then((r) => r.data.data);

export const jockeyAcceptRequest = (raceHorseId: number) =>
 axiosInstance
 .put<ApiResponse<RaceHorse>>(`/race-horse/${raceHorseId}/jockey-accept`)
 .then((r) => r.data.data);

export const jockeyDeclineRequest = (raceHorseId: number) =>
 axiosInstance
 .put<ApiResponse<RaceHorse>>(`/race-horse/${raceHorseId}/jockey-decline`)
 .then((r) => r.data.data);

// ── Withdrawal (Horse Owner requests, Admin approves/rejects) ─────────────────
export const requestWithdrawal = (payload: WithdrawRaceHorsePayload) =>
 axiosInstance
 .post<ApiResponse<RaceHorse>>('/race-horse/withdraw', payload)
 .then((r) => r.data.data);

export const approveWithdrawal = (raceHorseId: number) =>
 axiosInstance
 .put<ApiResponse<RaceHorse>>(`/race-horse/${raceHorseId}/approve-withdrawal`)
 .then((r) => r.data.data);

export const rejectWithdrawal = (raceHorseId: number) =>
 axiosInstance
 .put<ApiResponse<RaceHorse>>(`/race-horse/${raceHorseId}/reject-withdrawal`)
 .then((r) => r.data.data);

export const getWithdrawPending = () =>
 axiosInstance.get<ApiResponse<RaceHorse[]>>('/race-horse/withdraw-pending').then((r) => r.data.data);
