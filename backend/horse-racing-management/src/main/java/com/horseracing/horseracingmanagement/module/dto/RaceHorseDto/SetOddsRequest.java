package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetOddsRequest {
    @NotNull
    private Long raceHorseId;
    @NotNull
    private     BigDecimal odds;  // ← 2.0, 5.0, 10.0, 32.0
}
