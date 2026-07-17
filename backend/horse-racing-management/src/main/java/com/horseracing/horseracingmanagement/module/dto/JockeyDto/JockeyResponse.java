package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class JockeyResponse {
    private Long id;
    private String name;        // ← hiển thị trên dropdown
    private LocalDate dateOfBirth;
    private Long experienceYear;
    private String status;
    private String avatarUrl;
    private String coverImageUrl;
    private String description;
}