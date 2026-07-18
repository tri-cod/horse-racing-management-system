export type PenaltyType = 'FINE' | 'DISQUALIFY' | 'TIME_PENALTY' | 'WARNING';

export interface RefereeProfile {
  id: number;
  userId: number;
  name: string;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  experienceYears?: number | null;
  description?: string | null;
  status?: string | null;
  totalRacesRefereed?: number | null;
  totalPenaltiesGiven?: number | null;
}

export interface CompleteRefereeProfilePayload {
  experienceYears?: number | null;
  description?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
}

export interface RefereeRace {
  raceId: number;
  raceName: string;
  raceStatus: string;
  location?: string | null;
  startTime: string;
  totalHorses?: number | null;
  totalPenalties?: number | null;
}

export interface Penalty {
  id: number;
  raceHorseId: number;
  horseName?: string | null;
  refereeId: number;
  refereeName?: string | null;
  reason?: string | null;
  penaltyType: PenaltyType | string;
  amount?: number | null;
  timePenaltySeconds?: number | null;
  isDisqualified?: boolean | null;
  createdAt: string;
}

export interface IssuePenaltyPayload {
  raceHorseId: number;
  reason: string;
  penaltyType: PenaltyType;
  amount?: number | null;
  timePenaltySeconds?: number | null;
}