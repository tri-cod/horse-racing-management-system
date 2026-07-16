package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import com.horseracing.horseracingmanagement.common.validation.NoSpecialCharacters;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHorse {

    @Size(min = 2, max = 150, message = "Horse name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Horse name must not contain special characters")
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
