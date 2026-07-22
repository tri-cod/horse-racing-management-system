package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TrainerListItemResponse {
    private Long id;
    private String name;
    private LocalDate dateOfBirth;
    private Integer experienceYears;
    private String description;
    private String avatarUrl;
    private String status;
    private BigDecimal monthlyFee;  // ← giá thuê/tháng do trainer đặt
}
