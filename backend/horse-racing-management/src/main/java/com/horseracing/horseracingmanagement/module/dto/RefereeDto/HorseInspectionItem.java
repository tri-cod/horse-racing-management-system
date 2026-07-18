package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class HorseInspectionItem {
    private Long raceHorseId;
    private Long horseId;
    private String horseName;
    private String horseStatus;
    private Long jockeyId;
    private String jockeyName;
    private String jockeyStatus;
    private BigDecimal odds;
    private List<String> warnings;        // cảnh báo cho horse này
}