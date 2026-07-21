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

 // Report
 totalPendingReports: number;

 // Transactions
 totalPendingDeposits: number;
 totalPendingWithdraws: number;

 recentRaces: RecentRaceStats[];
}
