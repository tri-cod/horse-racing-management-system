import axiosInstance from './axiosInstance';
import type { ApiResponse, Trainer, RaceParticipation } from '@/types';

export interface CompleteTrainerProfilePayload {
 fullName?: string;
 specialization?: string;
 experience?: string;
 bio?: string;
 avatarUrl?: string | null;
 dateOfBirth?: string;
 experienceYears?: number;
 description?: string;
 monthlyFee?: number | null;
}

export const getTrainerProfile = () =>
 axiosInstance.get<ApiResponse<Trainer>>('/trainer/profile').then((r) => r.data.data);

export const completeTrainerProfile = (payload: CompleteTrainerProfilePayload) =>
 axiosInstance
 .put<ApiResponse<Trainer>>('/trainer/complete-profile', payload)
 .then((r) => r.data.data);

export const getTrainerList = () =>
  axiosInstance.get<ApiResponse<Trainer[]>>('/trainer/list').then((r) => r.data.data);

export const getMyRaceHistory = () =>
  axiosInstance.get<ApiResponse<RaceParticipation[]>>('/trainer/my-race-history').then((r) => r.data.data);

export const getMyUpcomingRaces = () =>
  axiosInstance.get<ApiResponse<RaceParticipation[]>>('/trainer/my-upcoming-races').then((r) => r.data.data);

export const getMyCurrentRaces = () =>
  axiosInstance.get<ApiResponse<RaceParticipation[]>>('/trainer/my-current-races').then((r) => r.data.data);
