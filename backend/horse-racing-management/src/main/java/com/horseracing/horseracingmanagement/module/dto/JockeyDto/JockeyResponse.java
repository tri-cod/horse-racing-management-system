package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JockeyResponse {
    private Long id;
    private String name;        // ← hiển thị trên dropdown
    private Long age;
    private Long experienceYear;
    private String status;
}