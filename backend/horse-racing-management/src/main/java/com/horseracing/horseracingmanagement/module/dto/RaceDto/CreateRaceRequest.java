package com.horseracing.horseracingmanagement.module.dto.RaceDto;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRaceRequest {
    @NotBlank
    private String raceName;
    private Instant startTime;
    private Instant endTime;
    private String trackName;
    private String trackCondition;
    private String surfaceType;
    private Long totalprizepool;
    private String distance;
    private String location;
    private Long capacity;
    private String bannerImageurl;
    private RaceStatus status;
    private Long entryFee;
    private Long refereeId;
    private Instant registrationDeadline;
}