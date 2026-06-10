package com.horseracing.horseracingmanagement.module.dto.Bet;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BetUpdateMessage {
    private Long raceHorseId;
    private String horseName;
    private BigDecimal totalBetAmount;
    private Long totalBetCount;
    private BigDecimal odds;
}