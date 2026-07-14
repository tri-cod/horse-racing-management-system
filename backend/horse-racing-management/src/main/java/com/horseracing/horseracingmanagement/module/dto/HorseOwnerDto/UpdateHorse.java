package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHorse {
    private String horseName;
    private String breed;
    private Integer age;
    private String gender;
    private Integer speedRating;
    private String history_rank;
    private String avatar_url;
    private Long weight;
    private HorseStatus status;
}
