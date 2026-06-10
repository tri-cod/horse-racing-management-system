package com.horseracing.horseracingmanagement.module.dto.Bet;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BetItemResponse {
    private Long id;
    private Long raceHorseId;
    private String horseName;
    private Long betAmount;
    private BigDecimal odds;
    private String resultStatus;
    private BigDecimal payout;
}