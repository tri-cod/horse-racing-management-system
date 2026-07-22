package com.horseracing.horseracingmanagement.module.dto.AdminDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    // Tài chính
    private BigDecimal adminWalletBalance;      // số dư ví hệ thống
    private BigDecimal totalDepositApproved;    // tổng tiền đã nạp vào hệ thống
    private BigDecimal totalWithdrawApproved;   // tổng tiền đã rút ra
    private BigDecimal totalEntryFeeCollected;  // tổng phí tham gia thu được
    private BigDecimal totalPrizePoolFunded;    // tổng tiền giải đã chi
    private BigDecimal totalBetLost;            // tổng tiền bet thua → vào admin

    // Race
    private Long totalRaces;
    private Long totalFinishedRaces;
    private Long totalOngoingRaces;
    private Long totalUpcomingRaces;
    private Long totalCancelledRaces;

    // User
    private Long totalUsers;
    private Long totalHorseOwners;
    private Long totalTrainers;
    private Long totalJockeys;
    private Long totalReferees;
    private Long totalSpectators;

    // Horse
    private Long totalHorses;
    private Long totalActiveHorses;
    private Long totalRacingHorses;

    // Transactions
    private Long totalPendingDeposits;
    private Long totalPendingWithdraws;

    // Recent (5 race gần nhất)
    private List<RecentRaceStats> recentRaces;
}

