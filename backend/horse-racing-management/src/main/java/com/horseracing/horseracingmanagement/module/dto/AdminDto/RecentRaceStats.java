package com.horseracing.horseracingmanagement.module.dto.AdminDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RecentRaceStats {
    private Long raceId;
    private String raceName;
    private String status;
    private Instant startTime;
    private Long totalHorses;
    private Long totalBets;
    private Long prizePool;
}