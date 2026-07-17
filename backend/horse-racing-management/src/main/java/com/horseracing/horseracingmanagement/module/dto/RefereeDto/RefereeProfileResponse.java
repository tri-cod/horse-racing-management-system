package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RefereeProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String avatarUrl;
    private String coverImageUrl;
    private Long experienceYears;
    private String description;
    private String status;
    // Thống kê
    private Long totalRacesRefereed;   // tổng số race đã làm trọng tài
    private Long totalPenaltiesGiven;  // tổng số lần phạt
}