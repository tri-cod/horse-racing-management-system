package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteRefereeProfileRequest {
    private Long experienceYears;
    private String description;
    private String avatarUrl;
    private String coverImageUrl;
}