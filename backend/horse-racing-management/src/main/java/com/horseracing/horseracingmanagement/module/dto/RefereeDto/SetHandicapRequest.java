package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetHandicapRequest {
    @NotNull
    private Long raceId;

    @NotEmpty
    @Valid
    private List<HandicapEntry> handicaps;
}
