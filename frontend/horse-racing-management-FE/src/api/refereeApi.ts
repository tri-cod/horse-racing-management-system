import axiosInstance from './axiosInstance';
import type {
 ApiResponse,
 Race,
 RaceHorse,
 RaceResult,
 RaceListParams,
 SetRaceResultPayload,
 UpdateRacePayload,
} from '@/types';

export const startRace = (id: number) =>
 axiosInstance.put<ApiResponse<Race>>(`/races/${id}/start`).then((r) => r.data.data);

export const finishRace = (id: number) =>
 axiosInstance.put<ApiResponse<Race>>(`/races/${id}/finish`).then((r) => r.data.data);

export const getAllRaces = ({ status, page = 0, size = 100 }: RaceListParams = {}) => {
 const params: Record<string, unknown> = { page, size };
 if (status) params.status = status;
 return axiosInstance
 .get<ApiResponse<{ content: Race[] }>>('/races/list', { params })
 .then((r) => r.data.data);
};

export const getHorsesByRace = (raceId: number) =>
 axiosInstance
 .get<ApiResponse<RaceHorse[]>>(`/race-horse/race/${raceId}`)
 .then((r) => r.data.data);

export const setRaceResult = (payload: SetRaceResultPayload) =>
 axiosInstance.post<ApiResponse<null>>('/race-results', payload).then((r) => r.data);

export const getRaceResults = (raceId: number) =>
 axiosInstance
 .get<ApiResponse<RaceResult[]>>(`/race-results/race/${raceId}`)
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
 return axiosInstance
 .put<ApiResponse<Race>>(`/races/update/${race.id}`, payload)
 .then((r) => r.data.data);
};
