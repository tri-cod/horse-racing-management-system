// Shared shape returned by the Jockey/Trainer/HorseOwner "my races" endpoints
// (my-race-history / my-upcoming-races / my-current-races) — mirrors backend
// RaceParticipationResponse. Referee has its own richer RefereeRace type instead.
export interface RaceParticipation {
  raceId: number;
  raceName: string;
  raceStatus?: string | null;
  location?: string | null;
  startTime?: string | null;

  horseId?: number | null;
  horseName?: string | null;
  horseAvatarUrl?: string | null;

  jockeyId?: number | null;
  jockeyName?: string | null;

  trainerId?: number | null;
  trainerName?: string | null;

  rank?: number | null;
  completionTimeSeconds?: number | null;
  completionTimeFormatted?: string | null;
  rewards?: number | null;

  registrationStatus?: string | null;
  registerAt?: string | null;
}
