package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HandicapEntry {
    @NotNull
    private Long raceHorseId;

    @NotNull
    @DecimalMin(value = "0.0", message = "Handicap cannot be negative")
    @DecimalMax(value = "120.0", message = "Handicap looks too large — check the value")
    private Double handicapSeconds;
}
