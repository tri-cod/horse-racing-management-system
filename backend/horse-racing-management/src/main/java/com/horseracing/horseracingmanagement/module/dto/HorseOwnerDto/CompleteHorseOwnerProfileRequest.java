package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteHorseOwnerProfileRequest {
    private String name;
    private String description;
    private String avatarUrl;
    private String coverImageUrl;
    private String phone;
    private String address;
}