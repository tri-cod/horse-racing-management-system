package com.horseracing.horseracingmanagement.module.dto.ReportDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long reporterId;
    private String reporterName;
    private String targetType;
    private Long targetId;
    private String targetName;
    private String reason;
    private String detail;
    private String status;
    private String adminNote;
    private Instant createdAt;
    private Instant reviewedAt;
}