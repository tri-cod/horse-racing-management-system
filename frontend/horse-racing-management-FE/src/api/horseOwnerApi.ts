import axiosInstance from './axiosInstance';
import type { ApiResponse, Horse, HorseOwnerProfile, CompleteHorseOwnerProfilePayload, HorseOwnerPublicProfile, Penalty, RaceParticipation } from '@/types';

export interface SignHorsePayload {
 horseName: string;
 breed?: string;
 age?: number;
 gender?: string;
 speedRating?: number;
 history_rank?: string;
 avatar_url?: string;
 weight?: number;
 status?: string;
}

export type UpdateHorsePayload = Partial<SignHorsePayload>;

export const signHorse = (payload: SignHorsePayload) =>
 axiosInstance.post<ApiResponse<Horse>>('/horse-owner/horses', payload).then((r) => r.data.data);

export const updateHorse = (horseId: number, payload: UpdateHorsePayload) =>
 axiosInstance.patch<ApiResponse<Horse>>(`/horse-owner/horses/${horseId}`, payload).then((r) => r.data.data);

export const deleteHorse = (horseId: number) =>
 axiosInstance.delete<ApiResponse<null>>(`/horse-owner/horses/${horseId}`).then((r) => r.data);

export const uploadAvatar = (file: File): Promise<string> => {
 const formData = new FormData();
 formData.append('file', file);
 return axiosInstance
 .post<ApiResponse<{ avatarUrl: string } | string>>('/horse-owner/horses/avatar', formData)
 .then((r) => {
 const data = r.data.data;
 return typeof data === 'string' ? data : data.avatarUrl;
 });
};

export const getMyHorses = () =>
 axiosInstance.get<ApiResponse<Horse[]>>('/horse-owner/horses').then((r) => r.data.data);

export const getHorseById = (horseId: number) =>
 axiosInstance
 .get<ApiResponse<Horse>>(`/horse-owner/horses/${horseId}`)
 .then((r) => r.data.data);

export const getAvailableHorses = (raceId: number) =>
  axiosInstance
    .get<ApiResponse<Horse[]>>('/horse-owner/horses/available', { params: { raceId } })
    .then((r) => r.data.data);

export const getMyProfile = () =>
 axiosInstance.get<ApiResponse<HorseOwnerProfile>>('/horse-owner/profile/me').then((r) => r.data.data);

export const completeProfile = (payload: CompleteHorseOwnerProfilePayload) =>
 axiosInstance
 .put<ApiResponse<HorseOwnerProfile>>('/horse-owner/profile/complete', payload)
 .then((r) => r.data.data);

// Public — no auth required, used by the public horse-owner profile page.
export const getOwnerStats = (ownerId: number) =>
 axiosInstance
 .get<ApiResponse<HorseOwnerPublicProfile>>(`/horse-owner/${ownerId}/stats`)
 .then((r) => r.data.data);

export const getHorsePenalties = (horseId: number) =>
 axiosInstance
 .get<ApiResponse<Penalty[]>>(`/horse-owner/horses/${horseId}/penalties`)
 .then((r) => r.data.data);

export const getMyPenalties = () =>
 axiosInstance.get<ApiResponse<Penalty[]>>('/horse-owner/penalties').then((r) => r.data.data);

export const getMyRaceHistory = () =>
 axiosInstance.get<ApiResponse<RaceParticipation[]>>('/horse-owner/race-history').then((r) => r.data.data);

export const getMyUpcomingRaces = () =>
 axiosInstance.get<ApiResponse<RaceParticipation[]>>('/horse-owner/upcoming-races').then((r) => r.data.data);

export const getMyCurrentRaces = () =>
 axiosInstance.get<ApiResponse<RaceParticipation[]>>('/horse-owner/current-races').then((r) => r.data.data);
