package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteJockeyProfileRequest {
    private Long age;
    private Long experienceYear;
    private String description;
    private String avatarUrl;
}
