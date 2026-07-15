package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

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
    private Long raceHorseId;

    @NotNull
    private BigDecimal jockeyRevenuePercent; // ← id của RaceHorse đang Pending
    @NotNull
    private Long jockeyId;
}
