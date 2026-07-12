import axiosInstance from './axiosInstance';
import type { ApiResponse, Trainer } from '@/types';

export interface CompleteTrainerProfilePayload {
 fullName?: string;
 specialization?: string;
 experience?: string;
 bio?: string;
 avatarUrl?: string | null;
 age?: number;
 experienceYears?: number;
 description?: string;
}

export const getTrainerProfile = () =>
 axiosInstance.get<ApiResponse<Trainer>>('/trainer/profile').then((r) => r.data.data);

export const completeTrainerProfile = (payload: CompleteTrainerProfilePayload) =>
 axiosInstance
 .put<ApiResponse<Trainer>>('/trainer/complete-profile', payload)
 .then((r) => r.data.data);

export const getTrainerList = () =>
  axiosInstance.get<ApiResponse<Trainer[]>>('/trainer/list').then((r) => r.data.data);
