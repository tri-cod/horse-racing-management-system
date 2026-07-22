package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrainerHorseResponse {
    private Long horseId;
    private String horseName;
    private String breed;
    private Integer age;
    private Integer speedRating;
    private String avatarUrl;
    private String status;      // ACTIVE, RACING, FINISHED...
    private Long ownerId;
    private String ownerName;
}
