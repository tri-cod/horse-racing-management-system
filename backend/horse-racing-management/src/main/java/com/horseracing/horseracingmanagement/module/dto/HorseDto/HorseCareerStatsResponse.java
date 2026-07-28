package com.horseracing.horseracingmanagement.module.dto.HorseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseCareerStatsResponse {
    private Long horseId;

    private long totalStarts;    // số lần ra sân đã có kết quả
    private long totalWins;      // số lần hạng 1
    private long totalPodiums;   // số lần vào top 3
    private Long totalEarnings;  // tổng tiền thưởng đã nhận
    private Long bestRank;       // hạng tốt nhất, null nếu chưa đua lần nào

    private double winRate;      // % thắng, 2 chữ số thập phân
    private double podiumRate;   // % vào top 3
}
