package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private String specialization;      // ← thêm
    private String location;            // ← thêm
    private Integer maxHorses;          // ← thêm
    private BigDecimal monthlyFee;      // ← thêm
    private BigDecimal periodFee;       // ← thêm
    private Integer periodMonths;       // ← thêm
    private Boolean isAvailable;
}