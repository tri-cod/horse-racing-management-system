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
    private String horseAvatarUrl;
    private String breed;
    private Integer age;
    private String gender;
    private Long weight;
    private Integer speedRating;
    private String historyRank;
    private Long jockeyId;
    private String jockeyName;
    private String jockeyAvatarUrl;
    private String jockeyStatus;
    private BigDecimal odds;
    private List<String> warnings;        // cảnh báo cho horse này
    private boolean verified;             // referee đã tick "OK" thủ công
    private boolean reported;             // đã có report/penalty cho horse này trong race
}