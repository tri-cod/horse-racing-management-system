package com.horseracing.horseracingmanagement.module.dto.Trainer;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrainerStatsResponse {
    private Long trainerId;
    private String name;
    private String avatarUrl;
    private String coverImageUrl;
    private LocalDate dateOfBirth;
    private Integer experienceYears;
    private String description;
    private Long totalHorses;    // tổng số ngựa đang huấn luyện
    private Long totalRaces;     // tổng số trận ngựa đã tham gia
    private Long totalWins;      // số lần ngựa về hạng 1
    private Double winRate;
    private Long totalRewards;
    private List<RaceParticipationResponse> recentHistory;
}