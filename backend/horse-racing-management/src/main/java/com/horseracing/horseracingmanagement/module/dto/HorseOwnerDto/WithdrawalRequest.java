package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequest {
    private Long horseId;
    private Long raceId;
    private Long jockeyId;
    private String reason;

}
