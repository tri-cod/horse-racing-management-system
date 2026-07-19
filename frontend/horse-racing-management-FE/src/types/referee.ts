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

export type InspectionIssueType = 'WRONG_HORSE' | 'WRONG_JOCKEY' | 'EQUIPMENT_ISSUE' | 'HORSE_UNFIT';

export interface HorseInspectionItem {
  raceHorseId: number;
  horseId: number;
  horseName: string;
  horseStatus: string;
  jockeyId?: number | null;
  jockeyName?: string | null;
  jockeyStatus?: string | null;
  odds?: number | null;
  warnings: string[];
}

export interface PreRaceInspectionResponse {
  raceId: number;
  raceName: string;
  horses: HorseInspectionItem[];
  issues: string[];
  readyToRace: boolean;
}

export interface ReportInspectionIssuePayload {
  raceHorseId: number;
  issueType: InspectionIssueType;
  description: string;
}