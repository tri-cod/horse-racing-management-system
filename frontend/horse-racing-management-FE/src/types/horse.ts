export type HorseStatus = 'ACTIVE' | 'RACING' | 'FINISHED' | 'INACTIVE' | 'RETIRED' | 'BANNED';

export interface HorseCurrentStatusResponse {
  horseId: number;
  horseName: string;
  breed?: string;
  avatarUrl?: string;
  status?: string;
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
  jockeyName?: string;
  totalParticipants?: number;
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
 status: HorseStatus;
 ownerId: number;
 ownerName?: string;
 trainerId?: number;
 trainerName?: string;
 createdAt?: string;
}