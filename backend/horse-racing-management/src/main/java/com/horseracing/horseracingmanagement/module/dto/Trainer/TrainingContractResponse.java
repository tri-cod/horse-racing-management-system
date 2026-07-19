package com.horseracing.horseracingmanagement.module.dto.Trainer;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
@Data
@Builder
public class TrainingContractResponse {
    private Long id;
    private Long horseId;
    private String horseName;
    private String horseAvatarUrl;
    private Long trainerId;
    private String trainerName;
    private String trainerAvatarUrl;
    private Long ownerId;
    private String ownerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal fee;
    private String feeType;
    private String ownerNote;
    private String trainerNote;
    private String status;
    private Instant createdAt;
    private Instant acceptedAt;

    // ← thông tin còn bao nhiêu ngày với trainer
    private Long daysRemaining;      // null nếu chưa ACTIVE
    private Long totalDays;          // tổng số ngày hợp đồng
    private Double progressPercent;
}
