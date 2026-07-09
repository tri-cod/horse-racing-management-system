package com.horseracing.horseracingmanagement.module.dto.RaceResult;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RaceHistoryResponse {
    private Long raceId;
    private String raceName;
    private String location;
    private Instant startTime;
    private Long rank;
    private Double completionTimeSeconds;
    private String completionTimeFormatted;
    private Long rewards;
    private String jockeyName;
    private Long totalParticipants;
}