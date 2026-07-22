package com.horseracing.horseracingmanagement.module.dto.RaceHorseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HorseEligibilityResponse {
    private Long horseId;
    private String horseName;
    private Long raceId;
    private boolean eligible;
    private List<String> reasons;    // lý do KHÔNG đủ điều kiện (chặn cứng)
    private List<String> warnings;   // cảnh báo mềm — vẫn đăng ký được
    private Long horseEarnings;      // tiền thưởng hiện tại, để frontend hiển thị
}