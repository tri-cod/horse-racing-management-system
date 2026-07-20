export interface HorseOwnerProfile {
  id: number;
  userId: number;
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  address?: string | null;
  totalHorses?: number | null;
  status?: string | null;
}

export interface CompleteHorseOwnerProfilePayload {
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  address?: string | null;
}

// Public profile — GET /horse-owner/{ownerId}/stats, no auth required.
export interface HorseOwnerPublicProfile {
  ownerId: number;
  name: string;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  status?: string | null;
  totalHorses?: number | null;
  totalRaces?: number | null;
  totalWins?: number | null;
  winRate?: number | null;
  totalRewards?: number | null;
  horses?: HorseOwnerHorseSummary[];
}

export interface HorseOwnerHorseSummary {
  id: number;
  horseName: string;
  breed?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
}
