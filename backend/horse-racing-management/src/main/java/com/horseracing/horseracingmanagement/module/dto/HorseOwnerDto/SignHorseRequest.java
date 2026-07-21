package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import com.horseracing.horseracingmanagement.common.validation.NoSpecialCharacters;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@NoArgsConstructor   // ← thêm cái này
@AllArgsConstructor
public class SignHorseRequest
{
    @NotBlank(message = "Horse name is required")
    @Size(min = 2, max = 150, message = "Horse name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Horse name must not contain special characters")
    public String horseName;

    public String breed;
    public int age;
    public String gender;
    public int speedRating;
    public List<String> raceHistory;  // ← đổi từ String history_rank sang List
    public String avatar_url;
    public String description;
    public Long weight;
    public HorseStatus status;
}