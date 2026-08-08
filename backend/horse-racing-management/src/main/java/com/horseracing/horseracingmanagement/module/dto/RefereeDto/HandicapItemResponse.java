package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HandicapItemResponse {
    private Long raceHorseId;
    private Long horseId;
    private String horseName;
    private String horseAvatarUrl;
    private String breed;
    private Integer speedRating;
    private Long jockeyId;
    private String jockeyName;
    private Double handicapSeconds;
    private Double suggestedHandicapSeconds;
}
