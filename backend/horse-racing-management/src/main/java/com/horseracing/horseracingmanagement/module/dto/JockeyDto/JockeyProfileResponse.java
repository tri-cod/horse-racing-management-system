package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JockeyProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String avatarUrl;       // ← ảnh đại diện
    private String coverImageUrl;
    private Long age;
    private Long experienceYear;
    private String description;
    private String status;

    // Thống kê race
    private Long totalRaces;         // tổng số race đã tham gia
    private Long totalWins;          // số lần về nhất
    private Double winRate;          // tỉ lệ thắng
}