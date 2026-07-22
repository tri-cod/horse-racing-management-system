// Mirrors backend TrainingContract lifecycle. ACCEPTED is declared in the entity but
// never produced — trainer acceptance jumps straight to ACTIVE. COMPLETED is produced
// by the daily auto-complete job once a contract's end date passes.
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
