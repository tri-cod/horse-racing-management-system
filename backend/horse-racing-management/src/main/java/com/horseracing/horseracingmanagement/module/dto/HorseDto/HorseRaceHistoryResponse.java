package com.horseracing.horseracingmanagement.module.dto.HorseDto;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class HorseRaceHistoryResponse {
    private Long raceHorseId;
    private Long raceId;
    private String raceName;
    private String raceStatus;     // OPEN_REGISTRATION, ONGOING, FINISHED...
    private Instant startTime;
    private String registrationStatus;  // Pending, Approved, Rejected
    private Long jockeyId;
    private String jockeyName;
    private Long rank;             // null nếu race chưa Finished

    // Danh hiệu (VD: "Vô địch", "Ngựa xuất sắc nhất"), null nếu chưa có kết quả/không có danh hiệu
    private String title;
}
