// Mirrors backend TrainingContract lifecycle. ACCEPTED/COMPLETED are declared in
// the entity but never produced by the current backend, so the UI treats the
// live set as PENDING / ACTIVE / REJECTED / CANCELLED.
export type TrainingContractStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'REJECTED'
  | 'CANCELLED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | string;

export type TrainingFeeType = 'MONTHLY' | 'PERIOD' | string;

export interface TrainingContract {
  id: number;
  horseId: number;
  horseName?: string;
  horseAvatarUrl?: string;
  trainerId: number;
  trainerName?: string;
  trainerAvatarUrl?: string;
  ownerId: number;
  ownerName?: string;
  startDate?: string; // LocalDate — 'yyyy-MM-dd'
  endDate?: string;
  fee: number;        // BigDecimal on the wire — coerce with Number() before formatting
  feeType?: TrainingFeeType;
  ownerNote?: string;
  trainerNote?: string;
  status: TrainingContractStatus;
  createdAt?: string;
  acceptedAt?: string;
  daysRemaining?: number | null; // null unless ACTIVE
  totalDays?: number | null;
  progressPercent?: number | null;
}

export interface SendTrainingContractPayload {
  horseId: number;
  trainerId: number;
  startDate: string; // 'yyyy-MM-dd'
  endDate: string;
  fee: number;
  feeType: TrainingFeeType;
  ownerNote?: string;
}
