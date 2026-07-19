package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseOwnerProfileResponse {
    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String avatarUrl;
    private String coverImageUrl;
    private String address;
    private Integer totalHorses;
    private String status;
}