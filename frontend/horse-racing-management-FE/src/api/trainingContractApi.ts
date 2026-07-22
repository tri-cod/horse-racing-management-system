import axiosInstance from './axiosInstance';
import type { ApiResponse, TrainingContract, SendTrainingContractPayload } from '@/types';

// Owner creates a hire request for a trainer (status starts PENDING).
export const sendTrainingContract = (payload: SendTrainingContractPayload) =>
  axiosInstance
    .post<ApiResponse<TrainingContract>>('/training-contracts', payload)
    .then((r) => r.data.data);

// Owner cancels a request while it's still PENDING.
export const cancelTrainingContract = (id: number) =>
  axiosInstance
    .put<ApiResponse<TrainingContract>>(`/training-contracts/${id}/cancel`)
    .then((r) => r.data.data);

// All of the owner's contracts, any status.
export const getMyContractsAsOwner = () =>
  axiosInstance
    .get<ApiResponse<TrainingContract[]>>('/training-contracts/my-contracts')
    .then((r) => r.data.data);

// ── Trainer side ──────────────────────────────────────────────
// All of the trainer's contracts, any status.
export const getMyContractsAsTrainer = () =>
  axiosInstance
    .get<ApiResponse<TrainingContract[]>>('/training-contracts/my-trainer-contracts')
    .then((r) => r.data.data);

// Trainer accepts a pending request — the owner's fee is escrowed at this point.
export const acceptTrainingContract = (id: number, trainerNote?: string) =>
  axiosInstance
    .put<ApiResponse<TrainingContract>>(`/training-contracts/${id}/accept`, null, {
      params: trainerNote ? { trainerNote } : undefined,
    })
    .then((r) => r.data.data);

// Trainer declines a pending request.
export const rejectTrainingContract = (id: number, trainerNote?: string) =>
  axiosInstance
    .put<ApiResponse<TrainingContract>>(`/training-contracts/${id}/reject`, null, {
      params: trainerNote ? { trainerNote } : undefined,
    })
    .then((r) => r.data.data);
