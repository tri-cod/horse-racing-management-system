package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PenaltyResponse {
    private Long id;
    private Long raceHorseId;
    private String horseName;
    private Long refereeId;
    private String refereeName;
    private String reason;
    private String penaltyType;
    private Long amount;
    private Double timePenaltySeconds;
    private Boolean isDisqualified;
    private Instant createdAt;
}