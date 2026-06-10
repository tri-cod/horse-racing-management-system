package com.horseracing.horseracingmanagement.module.dto.Bet;


import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBetRequest {
    @NotNull
    private Long raceId;
    @NotNull
    @NotEmpty
    private List<BetItemDto> betItems;  // ← list vì có thể bet nhiều con ngựa
}
