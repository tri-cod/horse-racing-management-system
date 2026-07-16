package com.horseracing.horseracingmanagement.module.dto.JockeyDto;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JockeyStatsResponse {
    private Long jockeyId;
    private String name;
    private String avatarUrl;
    private String coverImageUrl;
    private Long age;
    private Long experienceYear;
    private String description;
    private Long totalRaces;     // tổng số trận
    private Long totalWins;      // số lần hạng 1
    private Long totalTop3;      // số lần vào top 3
    private Double winRate;      // % thắng
    private Long totalRewards;   // tổng tiền thưởng nhận được
    private List<RaceParticipationResponse> recentHistory;  // 5 trận gần nhất
}