package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor   // ← thêm cái này
@AllArgsConstructor
public class SignHorseRequest
{
    public String horseName;
    public String breed;
    public int age;
    public String gender;
    public int speedRating;
    public String history_rank;
    public String avatar_url;
    public Long weight;
    public HorseStatus status;
}
