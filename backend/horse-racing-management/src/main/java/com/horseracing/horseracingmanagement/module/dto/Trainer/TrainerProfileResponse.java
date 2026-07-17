package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class TrainerProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private LocalDate dateOfBirth;
    private Integer experienceYears;
    private String description;
    private String avatarUrl;       // ← ảnh đại diện
    private String coverImageUrl;
    private String status;
}