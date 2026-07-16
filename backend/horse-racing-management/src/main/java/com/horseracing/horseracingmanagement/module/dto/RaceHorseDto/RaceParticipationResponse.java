package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class RaceParticipationResponse {
    // Race info
    private Long raceId;
    private String raceName;
    private String raceStatus;
    private String location;
    private Instant startTime;

    // Horse info
    private Long horseId;
    private String horseName;
    private String horseAvatarUrl;

    // Jockey info
    private Long jockeyId;
    private String jockeyName;

    // Trainer info
    private Long trainerId;
    private String trainerName;

    // Kết quả (null nếu chưa FINISHED)
    private Long rank;
    private Double completionTimeSeconds;
    private String completionTimeFormatted;
    private Long rewards;

    // Registration
    private String registrationStatus;  // Approved, Pending...
    private Instant registerAt;
}