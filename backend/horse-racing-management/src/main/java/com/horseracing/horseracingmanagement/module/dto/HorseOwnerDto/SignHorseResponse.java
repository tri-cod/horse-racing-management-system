package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;


@Builder
@Data
@NoArgsConstructor   // ← thêm cái này
@AllArgsConstructor
public class SignHorseResponse {
    private Long id;
    private String horseName;
    private String breed;
    private int age;
    private String gender;
    private int speedRating;
    private List<String> raceHistory;  // ← đổi từ historyRank sang List
    private String avatarUrl;
    private Long weight;
    private String description;
    private HorseStatus status;

    private String trainerName;
    private Long trainerId;

    private Long ownerId;
    private String ownerName;

    private Instant  createdAt;
    private Instant updatedAt;
}
