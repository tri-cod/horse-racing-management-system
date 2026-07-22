package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
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
    private BigDecimal monthlyFee;  // ← giá thuê/tháng do trainer đặt
    private String specialization;  // ← chuyên môn / thế mạnh
    private Boolean isAvailable;    // ← còn nhận ngựa mới không
}