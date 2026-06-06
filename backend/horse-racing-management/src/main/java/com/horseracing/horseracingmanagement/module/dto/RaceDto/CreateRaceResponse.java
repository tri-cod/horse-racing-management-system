package com.horseracing.horseracingmanagement.module.dto.RaceDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRaceResponse {
    private Long id;
    private CreateRaceRequest createRaceRequest;
    private LocalDateTime createdAt;
}
