package com.horseracing.horseracingmanagement.module.dto.RaceResult;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceResultItemRequest {
    private Long raceHorseId;
    private Long rank;
    private String completionTime;
}