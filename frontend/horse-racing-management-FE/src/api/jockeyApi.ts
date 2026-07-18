import axiosInstance from './axiosInstance';
import type { ApiResponse, Jockey } from '@/types';

export const getJockeyList = () =>
 axiosInstance.get<ApiResponse<Jockey[]>>('/jockeys').then((r) => r.data.data);

export const getAvailableJockeys = (raceId: number) =>
  axiosInstance
    .get<ApiResponse<Jockey[]>>('/jockeys/available', { params: { raceId } })
    .then((r) => r.data.data);

export const getJockeyProfile = (jockeyId: number) =>
  axiosInstance.get<ApiResponse<Jockey>>(`/jockeys/${jockeyId}`).then((r) => r.data.data);

export const getMyProfile = () =>
  axiosInstance.get<ApiResponse<Jockey>>('/jockeys/me').then((r) => r.data.data);

export interface CompleteJockeyProfilePayload {
  dateOfBirth?: string;
  experienceYear?: number;
  description?: string;
  avatarUrl?: string | null;
}

export const completeProfile = (payload: CompleteJockeyProfilePayload) =>
  axiosInstance
    .put<ApiResponse<Jockey>>('/jockeys/complete-profile', payload)
    .then((r) => r.data.data);
