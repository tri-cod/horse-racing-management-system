package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PenaltyRequest {
    @NotNull
    private Long raceHorseId;
    @NotBlank
    private String reason;
    @NotBlank
    private String penaltyType;        // FINE, DISQUALIFY, TIME_PENALTY, WARNING
    private Long amount;               // số tiền phạt (nếu FINE)
    private Double timePenaltySeconds; // số giây phạt thêm (nếu TIME_PENALTY)
}