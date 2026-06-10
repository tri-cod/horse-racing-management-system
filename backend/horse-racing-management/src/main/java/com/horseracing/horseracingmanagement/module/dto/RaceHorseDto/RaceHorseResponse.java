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
    private Long raceId;
    private String raceName;
    private Long horseId;
    private String horseName;
    private Long jockeyId;
    private String jockeyName;
    private Long laneNumber;
    private Long startPosition;
    private String status;
    private Instant registerAt;

    // ← thêm để hiển thị cạnh con ngựa
    private BigDecimal totalBetAmount;  // tổng tiền đang được bet vào con này
    private Long totalBetCount;         // số người đang bet
    private BigDecimal odds;
}