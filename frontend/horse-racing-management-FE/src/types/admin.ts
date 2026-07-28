export interface RecentRaceStats {
 raceId: number;
 raceName: string;
 status: string;
 startTime?: string;
 totalHorses: number;
 totalBets: number;
 prizePool?: number;
}

export interface AdminStats {
 // Financial
 adminWalletBalance: number;
 totalDepositApproved: number;
 totalWithdrawApproved: number;
 totalEntryFeeCollected: number;
 totalPrizePoolFunded: number;
 totalBetLost: number;

 // Race
 totalRaces: number;
 totalFinishedRaces: number;
 totalOngoingRaces: number;
 totalUpcomingRaces: number;
 totalCancelledRaces: number;

 // User
 totalUsers: number;
 totalHorseOwners: number;
 totalTrainers: number;
 totalJockeys: number;
 totalReferees: number;
 totalSpectators: number;

 // Horse
 totalHorses: number;
 totalActiveHorses: number;
 totalRacingHorses: number;

 // Transactions
 totalPendingDeposits: number;
 totalPendingWithdraws: number;

 recentRaces: RecentRaceStats[];
}

// GET /admin/stats/race-revenue — per-race financial breakdown. Nothing is a new
// table; every figure is aggregated on the fly from race_horse/bet_items/race_result.
// betHandle (money staked) is NOT revenue — the system only actually keeps
// betHandle - betPayout, so don't add betHandle straight into any total.
export interface RaceRevenue {
 raceId: number;
 raceName: string;
 status: string;
 startTime?: string;

 totalHorses: number;
 totalBets: number;

 // Money in
 entryFeeCollected?: number;
 betHandle?: number;

 // Money out
 betPayout?: number;
 prizePaid?: number;

 // Result
 betMargin?: number;   // betHandle - betPayout — what the house actually keeps from betting
 netRevenue?: number;  // entryFeeCollected + betMargin - prizePaid
 marginPercent?: number;
}
