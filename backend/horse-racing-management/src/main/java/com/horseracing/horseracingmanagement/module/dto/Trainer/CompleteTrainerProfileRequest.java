package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTrainerProfileRequest {
    private Integer age;
    private Integer experienceYears;
    private String description;
    private String avatarUrl;       // ← ảnh đại diện
    private String coverImageUrl;
}