package com.horseracing.horseracingmanagement.module.dto.RaceDto;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.common.validation.NoSpecialCharacters;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(min = 2, max = 150, message = "Race name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Race name must not contain special characters")
    private String raceName;

    private Instant startTime;
    private Instant endTime;

    @Size(max = 150, message = "Track name must not exceed 150 characters")
    @NoSpecialCharacters(message = "Track name must not contain special characters")
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
    private Instant registrationOpenDate;
    private Instant registrationDeadline;
}