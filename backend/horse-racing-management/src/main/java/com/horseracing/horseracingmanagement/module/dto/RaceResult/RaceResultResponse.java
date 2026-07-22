package com.horseracing.horseracingmanagement.module.dto.RaceResult;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class RaceResultResponse {
    private Long id;
    private Long rank;
    private Double completionTimeSeconds;
    private String completionTimeFormatted;  // "1:32.45" để FE hiển thị

    // Horse info
    private Long horseId;
    private String horseName;
    private String breed;
    private String avatarUrl;

    // Jockey info
    private Long jockeyId;
    private String jockeyName;

    // Race info
    private Long raceId;
    private String raceName;
    private Instant raceStartTime;

    // Reward
    private Long rewards;

    // Danh hiệu (VD: "Vô địch", "Ngựa xuất sắc nhất"), null nếu không có
    private String title;
}