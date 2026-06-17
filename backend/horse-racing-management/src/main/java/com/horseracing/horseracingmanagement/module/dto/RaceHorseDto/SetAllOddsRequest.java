package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetAllOddsRequest {
    @NotNull
    private Long raceId;
    @NotNull
    private List<SetOddsRequest> oddsList;
}