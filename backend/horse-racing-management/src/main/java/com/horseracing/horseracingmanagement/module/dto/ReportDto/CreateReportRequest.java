package com.horseracing.horseracingmanagement.module.dto.ReportDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateReportRequest {
    @NotBlank
    private String targetType;  // USER hoặc HORSE
    @NotNull
    private Long targetId;
    @NotBlank
    private String reason;      // CHEATING, ABUSE, FAKE_INFO, RULE_VIOLATION, OTHER
    private String detail;      // mô tả chi tiết
}

