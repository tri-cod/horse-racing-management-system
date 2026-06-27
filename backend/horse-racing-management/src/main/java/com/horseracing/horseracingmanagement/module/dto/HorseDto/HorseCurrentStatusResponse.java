package com.horseracing.horseracingmanagement.module.dto.HorseDto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseCurrentStatusResponse {
    private Long horseId;
    private String horseName;
    private String breed;
    private String avatarUrl;
    private String status;          // status của horse (Active...)

    // Thông tin race hiện tại (null nếu đang trống, không tham gia race nào)
    private Long currentRaceId;
    private String currentRaceName;
    private String currentRaceStatus;
    private String registrationStatus;  // Pending/Approved trong race đó
}
