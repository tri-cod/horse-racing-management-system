package com.horseracing.horseracingmanagement.module.dto.Bet;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class BetResponse {
    private Long id;
    private Long raceId;
    private String raceName;
    private BigDecimal totalAmount;
    private String status;
    private List<BetItemResponse> betItems;
    private Instant createdAt;
}