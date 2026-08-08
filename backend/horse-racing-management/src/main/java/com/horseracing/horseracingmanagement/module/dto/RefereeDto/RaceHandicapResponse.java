package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RaceHandicapResponse {
    private Long raceId;
    private String raceName;
    private String raceStatus;
    private boolean editable;
    private List<HandicapItemResponse> horses;
}
