export type HorseStatus = 'ACTIVE' | 'RACING' | 'FINISHED' | 'INACTIVE' | 'RETIRED' | 'BANNED';

// Backend enum DistanceCategory — the distance band a horse runs best at.
export type DistanceCategory = 'SPRINT' | 'MILE' | 'MIDDLE' | 'LONG';

export interface HorseCurrentStatusResponse {
  horseId: number;
  horseName: string;
  breed?: string;
  avatarUrl?: string;
  status?: string;
  preferredDistance?: DistanceCategory | string | null;
  preferredSurface?: string | null;
  currentRaceId?: number;
  currentRaceName?: string;
  currentRaceStatus?: string;
  registrationStatus?: string;
}

export interface HorseRaceHistoryItem {
  raceId: number;
  raceName: string;
  location?: string;
  startTime?: string;
  rank?: number;
  completionTimeSeconds?: number;
  completionTimeFormatted?: string;
  rewards?: number;
  horseName?: string;
  jockeyName?: string;
  totalParticipants?: number;
}

// GET /race-results/horse/{horseId}/career — server-computed from race_result,
// not stored on the horse record. A brand-new horse returns all zeros (that's the
// correct state, not missing data).
export interface HorseCareerStats {
  horseId: number;
  totalStarts: number;
  totalWins: number;
  totalPodiums: number;
  totalEarnings?: number | null;
  bestRank?: number | null;
  winRate: number;
  podiumRate: number;
}

export interface Horse {
 id: number;
 horseName: string;
 breed?: string;
 age?: number;
 weight?: number;
 gender?: string;
 speedRating?: number;
 historyRank?: string;
 color?: string;
 avatarUrl?: string;
 description?: string;
 preferredDistance?: DistanceCategory | string | null;
 preferredSurface?: string | null;
 status: HorseStatus;
 ownerId: number;
 ownerName?: string;
 trainerId?: number;
 trainerName?: string;
 createdAt?: string;
}