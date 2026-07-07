import axiosInstance from './axiosInstance';
import type { ApiResponse, RaceHorse, RegisterHorseToRacePayload, SetOddsPayload } from '@/types';

export const registerHorseToRace = (payload: RegisterHorseToRacePayload) =>
 axiosInstance
 .post<ApiResponse<RaceHorse>>('/race-horse/register', payload)
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
