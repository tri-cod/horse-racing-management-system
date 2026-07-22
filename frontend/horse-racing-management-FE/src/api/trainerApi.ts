import axiosInstance from './axiosInstance';
import type { ApiResponse, Trainer, TrainerStats, TrainerHorse, TrainerRaceParticipation } from '@/types';

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
 isAvailable?: boolean | null;
}

export const getTrainerProfile = () =>
 axiosInstance.get<ApiResponse<Trainer>>('/trainer/profile').then((r) => r.data.data);

export const completeTrainerProfile = (payload: CompleteTrainerProfilePayload) =>
 axiosInstance
 .put<ApiResponse<Trainer>>('/trainer/complete-profile', payload)
 .then((r) => r.data.data);

export const getTrainerList = () =>
  axiosInstance.get<ApiResponse<Trainer[]>>('/trainer/list').then((r) => r.data.data);

// Career stats — public, by trainer id.
export const getTrainerStats = (trainerId: number) =>
  axiosInstance.get<ApiResponse<TrainerStats>>(`/trainer/${trainerId}/stats`).then((r) => r.data.data);

// Horses currently trained by this trainer — public, by trainer id.
export const getTrainerHorses = (trainerId: number) =>
  axiosInstance.get<ApiResponse<TrainerHorse[]>>(`/trainer/${trainerId}/horses`).then((r) => r.data.data);

// The logged-in trainer's own race participations (across their horses).
export const getMyTrainerUpcomingRaces = () =>
  axiosInstance.get<ApiResponse<TrainerRaceParticipation[]>>('/trainer/my-upcoming-races').then((r) => r.data.data);

export const getMyTrainerRaceHistory = () =>
  axiosInstance.get<ApiResponse<TrainerRaceParticipation[]>>('/trainer/my-race-history').then((r) => r.data.data);
