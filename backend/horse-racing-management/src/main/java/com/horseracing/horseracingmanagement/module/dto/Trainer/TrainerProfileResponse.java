package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrainerProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private Integer age;
    private Integer experienceYears;
    private String description;
    private String avatarUrl;
    private String status;
}