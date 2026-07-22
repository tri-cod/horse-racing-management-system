export interface Trainer {
 id: number;
 userId?: number;
 name?: string;
 fullName?: string;
 avatarUrl?: string;
 dateOfBirth?: string;
 experienceYears?: number;
 experience?: string;
 specialization?: string;
 description?: string;
 bio?: string;
 status?: string;
 monthlyFee?: number;   // giá thuê/tháng do trainer đặt (BigDecimal → number/string on wire)
 isAvailable?: boolean;
}

// One race a trainer's horse took part in (from /trainer/{id}/stats recentHistory).
export interface TrainerRaceParticipation {
 raceId: number;
 raceName?: string;
 raceStatus?: string;
 location?: string;
 startTime?: string;
 horseId?: number;
 horseName?: string;
 horseAvatarUrl?: string;
 jockeyName?: string;
 rank?: number | null;
 completionTimeFormatted?: string | null;
 rewards?: number | null;
 registrationStatus?: string;
}

// A horse currently under this trainer — GET /trainer/{id}/horses
export interface TrainerHorse {
 horseId: number;
 horseName?: string;
 breed?: string;
 age?: number;
 speedRating?: number;
 avatarUrl?: string;
 status?: string;
 ownerId?: number;
 ownerName?: string;
}

// Aggregated career stats — GET /trainer/{id}/stats
export interface TrainerStats {
 trainerId: number;
 name?: string;
 avatarUrl?: string;
 experienceYears?: number;
 totalHorses?: number;
 totalRaces?: number;
 totalWins?: number;
 winRate?: number;      // 0..1 or 0..100 depending on backend — normalize on display
 totalRewards?: number;
 recentHistory?: TrainerRaceParticipation[];
}
