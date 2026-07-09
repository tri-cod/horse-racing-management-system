package com.horseracing.horseracingmanagement.module.dto.RaceDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class    RaceResponse {
    private Long id;
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
    private String status;
    private Instant registrationDeadline;
    private Instant createdAt;
    private Instant updatedAt;

    // referee info
    private Long refereeId;
    private String refereeName;  // ← lấy từ user.fullName
}