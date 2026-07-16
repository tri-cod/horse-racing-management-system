package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

// Response
@Data
@Builder
public class RaceHorseResponse {
    private Long id;

    // Race info (trận đua)
    private Long raceId;
    private String raceName;
    private String raceStatus;
    private String trackName;
    private String location;
    private Instant raceDate;
    private Instant startTime;
    private Instant registrationDeadline;
    private Long entryFee;
    private Long totalPrizePool;      // tiền giải của trận đua

    private Long horseId;
    private String horseName;

    // Chủ ngựa (horse owner)
    private Long ownerId;
    private String ownerName;

    // Trainer
    private Long trainerId;
    private String trainerName;

    private Long jockeyId;
    private String jockeyName;

    // Phí chia thưởng đã thỏa thuận giữa owner và jockey
    private BigDecimal jockeyRevenuePercent;
    private BigDecimal ownerRevenuePercent;

    private Long laneNumber;
    private Long startPosition;
    private String status;
    private Instant registerAt;
    private String withdrawReason;

    // ← thêm để hiển thị cạnh con ngựa
    private BigDecimal totalBetAmount;  // tổng tiền đang được bet vào con này
    private Long totalBetCount;         // số người đang bet
    private BigDecimal odds;
}