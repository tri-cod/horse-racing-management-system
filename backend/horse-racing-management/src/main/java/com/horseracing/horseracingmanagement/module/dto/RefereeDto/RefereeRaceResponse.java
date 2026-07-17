package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RefereeRaceResponse {
    private Long raceId;
    private String raceName;
    private String raceStatus;
    private String location;
    private Instant startTime;
    private Long totalHorses;
    private Long totalPenalties;  // số lần phạt trong race này
}