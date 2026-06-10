package com.horseracing.horseracingmanagement.module.dto.Bet;

import com.horseracing.horseracingmanagement.common.constant.BetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BetItemDto {
    @NotNull
    private Long raceHorseId;
    @NotNull
    private Long betAmount;  // số tiền bet cho con này
}
