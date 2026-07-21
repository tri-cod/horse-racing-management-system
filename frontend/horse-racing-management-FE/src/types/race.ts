export type RaceStatus =
 | 'UPCOMING'
 | 'OPEN_REGISTRATION'
 | 'CLOSED_REGISTRATION'
 | 'SETTING_ODDS'
 | 'OPEN_BETTING'
 | 'ONGOING'
 | 'FINISHED'
 | 'CANCELLED';
 
// Backend enum RaceHorseStatus (SCREAMING_SNAKE), serialized as a plain string.
export type RaceHorseStatus =
  | 'PENDING'
  | 'PENDING_JOCKEY'     // registered, jockey hasn't responded yet
  | 'JOCKEY_REJECTED'    // jockey declined, owner must pick another
  | 'PENDING_ADMIN'      // jockey accepted, awaiting admin approval
  | 'APPROVED'           // admin approved
  | 'REJECTED'
  | 'WITHDRAW_PENDING'   // owner requested withdrawal, awaiting admin
  | 'WITHDRAW_REJECTED'
  | 'WITHDRAWN'
  | 'FINISHED'           // race result recorded for this entry
  | 'DISQUALIFIED'       // referee issued a disqualifying penalty
  | string;              // fallback for any other/legacy value
export interface Race {
 id: number;
 raceName: string;
 startTime: string;
 endTime?: string;
 trackName: string;
 trackCondition?: string;
 surfaceType?: string;
 totalprizepool?: number;
 distance?: string | number;
 location?: string;
 capacity?: number;
 bannerImageurl?: string;
 entryFee?: number;
 registrationOpenDate?: string;
 registrationDeadline?: string;
 refereeId?: number | null;
 status: RaceStatus;
 createdAt?: string;
 raceInspectedAt?: string | null;
}

export interface RaceHorse {
 id: number;
 raceId: number;
 raceName?: string;
 horseId: number;
 horseName?: string;
 horseAvatarUrl?: string;
 ownerId?: number;
 ownerName?: string;
 trainerId?: number;
 trainerName?: string;
 jockeyId?: number;
 jockeyName?: string;
 laneNumber?: number;
 odds?: number;
 finalPosition?: number;
 status: RaceHorseStatus;
 registerAt?: string;
 withdrawReason?: string;
 // Race context carried on the entry (used e.g. on the jockey's request list).
 startTime?: string;
 totalPrizePool?: number;
 jockeyRevenuePercent?: number;
}

export interface RaceResult {
 id: number;
 raceId: number;
 raceHorseId: number;
 horseName?: string;
 jockeyName?: string;
 finishPosition: number;
 finishTime?: string;
 prizeMoney?: number;
}

// Matches the backend's flat RaceResultResponse DTO returned by
// GET /race-results/race/{raceId} (all fields but `id` are optional).
export interface RaceResultFlat {
 id: number;
 rank?: number;
 completionTimeSeconds?: number;
 completionTimeFormatted?: string;
 horseId?: number;
 horseName?: string;
 breed?: string;
 avatarUrl?: string;
 jockeyId?: number;
 jockeyName?: string;
 raceId?: number;
 raceName?: string;
 raceStartTime?: string;
 rewards?: number;
}

export interface RaceResultNested {
 id: number;
 rank?: number;
 finishPosition?: number;
 completionTimeSeconds?: number;
 rewards?: number;
 prizeMoney?: number;
 raceHorse?: {
 odds?: number;
 horse?: { horseName?: string; breed?: string };
 jockey?: { user?: { fullName?: string } };
 };
}

export interface RaceSocketUpdate {
 status: RaceStatus;
 message?: string;
 updatedAt?: string;
}

export interface RaceListParams {
 status?: RaceStatus;
 page?: number;
 size?: number;
}

export interface CreateRacePayload {
 raceName: string;
 startTime: string;
 endTime?: string;
 trackName: string;
 trackCondition?: string;
 surfaceType?: string;
 totalprizepool?: number;
 distance?: string;
 location?: string;
 capacity?: number;
 bannerImageurl?: string;
 registrationOpenDate?: string;
 registrationDeadline?: string;
 refereeId?: number | null;
 /** Only applied on race creation — the backend does not read this field on update. */
 entryFee?: number;
}

export type UpdateRacePayload = CreateRacePayload & { status?: RaceStatus };

export interface RegisterHorseToRacePayload {
 raceId: number;
 horseId: number;
}

export interface SendJockeyRequestPayload {
 raceHorseId: number;
 jockeyId: number;
 jockeyRevenuePercent: number;
}

export interface WithdrawRaceHorsePayload {
 raceHorseId: number;
 reason: string;
}

export interface SetOddsPayload {
 raceHorseId: number;
 odds: number;
}

export interface SetRaceResultPayload {
  raceId: number;
  results: Array<{
    raceHorseId: number;
    rank: number;
    completionTimeSeconds?: number | null;
  }>;
}
