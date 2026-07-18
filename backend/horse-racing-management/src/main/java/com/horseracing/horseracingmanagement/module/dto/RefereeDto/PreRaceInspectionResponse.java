package com.horseracing.horseracingmanagement.module.dto.RefereeDto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PreRaceInspectionResponse {
    private Long raceId;
    private String raceName;
    private List<HorseInspectionItem> horses;
    private List<String> issues;          // danh sách vấn đề phát hiện
    private boolean readyToRace;          // true nếu không có vấn đề nghiêm trọng
}