package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteTrainerProfileRequest {
    private LocalDate dateOfBirth;
    private Integer experienceYears;
    private String description;
    private String avatarUrl;       // ← ảnh đại diện
    private String coverImageUrl;
}