package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JockeyRequestDto {
    @NotNull
    private Long raceHorseId; // ← id của RaceHorse đang Pending

    @NotNull
    @DecimalMin(value = "0", inclusive = true)
    @DecimalMax(value = "100", inclusive = true)
    private BigDecimal jockeyRevenuePercent; // % jockey được hưởng khi có giải, phần còn lại là của owner

    @NotNull
    private Long jockeyId;
}
