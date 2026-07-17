package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteJockeyProfileRequest {
    private Long experienceYear;
    private String description;
    private String avatarUrl;       // ← ảnh đại diện
    private String coverImageUrl;
    private LocalDate dateOfBirth;
}
