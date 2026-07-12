import axiosInstance from './axiosInstance';
import { updateRace } from './raceApi';
import type {
 ApiResponse,
 Race,
 RaceResult,
 SetRaceResultPayload,
 UpdateRacePayload,
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

// Closes registration by sending a full race update with status = CLOSED_REGISTRATION.
// The backend PUT endpoint requires all fields, so we spread the existing race object.
export const closeRegistration = (race: Race) => {
 const payload: UpdateRacePayload = {
 raceName: race.raceName,
 startTime: race.startTime,
 endTime: race.endTime,
 trackName: race.trackName,
 trackCondition: race.trackCondition,
 surfaceType: race.surfaceType,
 totalprizepool: race.totalprizepool,
 distance: race.distance?.toString(),
 location: race.location,
 capacity: race.capacity,
 bannerImageurl: race.bannerImageurl,
 registrationDeadline: race.registrationDeadline,
 refereeId: race.refereeId ?? null,
 status: 'CLOSED_REGISTRATION',
 };
 return updateRace(race.id, payload);
};