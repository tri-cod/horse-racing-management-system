package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InspectionIssueRequest {
    @NotNull
    private Long raceHorseId;
    @NotBlank
    private String issueType;  // WRONG_HORSE, WRONG_JOCKEY, EQUIPMENT_ISSUE, HORSE_UNFIT
    @NotBlank
    private String description;
}
