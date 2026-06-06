package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRaceHorseRequest {
    @NotNull
    private Long raceId;
    @NotNull
    private Long horseId;
    @NotNull
    private Long jockeyId;
}