package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequest {
    @NotNull
    private Long raceHorseId;  // ← dùng raceHorseId thay vì horseId+raceId+jockeyId
    @NotBlank
    private String reason;
}
