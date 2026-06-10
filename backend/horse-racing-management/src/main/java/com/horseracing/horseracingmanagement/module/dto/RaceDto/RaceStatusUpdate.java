package com.horseracing.horseracingmanagement.module.dto.RaceDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RaceStatusUpdate {
    private Long raceId;
    private String raceName;
    private String status;       // Upcoming, Ongoing, Finished
    private String message;
    private Instant updatedAt;
}