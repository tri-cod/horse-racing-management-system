import axiosInstance from './axiosInstance';
import type {
 ApiResponse,
 Race,
 RaceResult,
 SetRaceResultPayload,
 HorseRaceHistoryItem,
} from '@/types';

export { getHorsesByRace } from './raceHorseApi';

export const startRace = (id: number) =>
 axiosInstance.put<ApiResponse<Race>>(`/races/${id}/start`).then((r) => r.data.data);

export const finishRace = (id: number) =>
 axiosInstance.put<ApiResponse<Race>>(`/races/${id}/finish`).then((r) => r.data.data);

export const setRaceResult = (payload: SetRaceResultPayload) =>
 axiosInstance.post<ApiResponse<null>>('/race-results', payload).then((r) => r.data);

export const getRaceResults = (raceId: number) =>
 axiosInstance
 .get<ApiResponse<RaceResult[]>>(`/race-results/race/${raceId}`)
 .then((r) => r.data.data);

export const getHorseRaceHistory = (horseId: number) =>
 axiosInstance
 .get<ApiResponse<HorseRaceHistoryItem[]>>(`/race-results/horse/${horseId}/history`)
 .then((r) => r.data.data);

export const getHorseBestResult = (horseId: number) =>
 axiosInstance
 .get<ApiResponse<HorseRaceHistoryItem | null>>(`/race-results/horse/${horseId}/best`)
 .then((r) => r.data.data);


import type {
  RefereeProfile,
  CompleteRefereeProfilePayload,
  RefereeRace,
  Penalty,
  IssuePenaltyPayload,
  PreRaceInspectionResponse,
  ReportInspectionIssuePayload,
  VerifyHorsePayload,
} from '@/types';

/* ── Profile ────────────────────────────────────────────── */

export const completeRefereeProfile = (payload: CompleteRefereeProfilePayload) =>
  axiosInstance
    .put<ApiResponse<RefereeProfile>>('/referee/complete-profile', payload)
    .then((r) => r.data.data);

export const getMyRefereeProfile = () =>
  axiosInstance.get<ApiResponse<RefereeProfile>>('/referee/me').then((r) => r.data.data);

export const getRefereeProfile = (refereeId: number) =>
  axiosInstance.get<ApiResponse<RefereeProfile>>(`/referee/${refereeId}`).then((r) => r.data.data);

export const getAllReferees = () =>
  axiosInstance.get<ApiResponse<RefereeProfile[]>>('/referee').then((r) => r.data.data);

/* ── Races ──────────────────────────────────────────────── */

export const getMyUpcomingRaces = () =>
  axiosInstance.get<ApiResponse<RefereeRace[]>>('/referee/my-upcoming-races').then((r) => r.data.data);

export const getMyCurrentRaces = () =>
  axiosInstance.get<ApiResponse<RefereeRace[]>>('/referee/my-current-races').then((r) => r.data.data);

export const getMyRaceHistory = () =>
  axiosInstance.get<ApiResponse<RefereeRace[]>>('/referee/my-race-history').then((r) => r.data.data);

/* ── Penalty ────────────────────────────────────────────── */

export const issuePenalty = (payload: IssuePenaltyPayload) =>
  axiosInstance.post<ApiResponse<Penalty>>('/referee/penalty', payload).then((r) => r.data.data);

export const getPenaltiesByRace = (raceId: number) =>
  axiosInstance.get<ApiResponse<Penalty[]>>(`/referee/penalty/race/${raceId}`).then((r) => r.data.data);

export const getMyPenaltyHistory = () =>
  axiosInstance.get<ApiResponse<Penalty[]>>('/referee/penalty/my-history').then((r) => r.data.data);

export const cancelPenalty = (penaltyId: number) =>
  axiosInstance.delete<ApiResponse<string>>(`/referee/penalty/${penaltyId}`).then((r) => r.data);

/* ── Pre-race inspection ────────────────────────────────── */

export const inspectRace = (raceId: number) =>
  axiosInstance
    .get<ApiResponse<PreRaceInspectionResponse>>(`/referee/inspect-race/${raceId}`)
    .then((r) => r.data.data);

export const reportInspectionIssue = (payload: ReportInspectionIssuePayload) =>
  axiosInstance.post<ApiResponse<string>>('/referee/inspection-issue', payload).then((r) => r.data);

export const verifyHorse = (payload: VerifyHorsePayload) =>
  axiosInstance.put<ApiResponse<string>>('/referee/verify-horse', payload).then((r) => r.data);