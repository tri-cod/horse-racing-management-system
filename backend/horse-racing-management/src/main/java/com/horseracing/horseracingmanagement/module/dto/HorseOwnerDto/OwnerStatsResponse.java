package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;


import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnerStatsResponse {
    private Long ownerId;
    private String name;
    private String avatarUrl;
    private String coverImageUrl;
    private String description;
    private String status;
    private Long totalHorses;    // tổng số ngựa sở hữu
    private Long totalRaces;     // tổng số trận tham gia
    private Long totalWins;      // số lần ngựa về hạng 1
    private Double winRate;
    private Long totalRewards;   // tổng tiền thưởng
    private List<SignHorseResponse> horses;               // danh sách ngựa
    private List<RaceParticipationResponse> recentHistory;
}