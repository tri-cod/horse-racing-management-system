package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyHorseRequest {
    @NotNull
    private Long raceHorseId;
    @NotNull
    private Boolean verified;
}
