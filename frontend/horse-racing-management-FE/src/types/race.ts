export type RaceStatus =
 | 'UPCOMING'
 | 'OPEN_REGISTRATION'
 | 'CLOSED_REGISTRATION'
 | 'ONGOING'
 | 'FINISHED'
 | 'CANCELLED';

export type RaceHorseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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
 registrationDeadline?: string;
 refereeId?: number | null;
 status: RaceStatus;
 createdAt?: string;
}

export interface RaceHorse {
 id: number;
 raceId: number;
 horseId: number;
 horseName?: string;
 horseAvatarUrl?: string;
 jockeyId?: number;
 jockeyName?: string;
 laneNumber?: number;
 odds?: number;
 finalPosition?: number;
 status: RaceHorseStatus;
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
 registrationDeadline?: string;
 refereeId?: number | null;
}

export type UpdateRacePayload = CreateRacePayload & { status?: RaceStatus };

export interface RegisterHorseToRacePayload {
 raceId: number;
 horseId: number;
 jockeyId?: number;
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
