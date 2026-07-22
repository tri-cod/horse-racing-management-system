package com.horseracing.horseracingmanagement.module.dto.RaceResult;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RaceResultItemRequest {
    @NotNull
    private Long raceHorseId;
    @NotNull
    private Double completionTimeSeconds;  // ← chỉ nhập giây
    // ← bỏ rank, system tự tính

    // Danh hiệu tùy chọn, referee tự gõ (VD: "Ngựa xuất sắc nhất"). Để trống nếu không có.
    private String title;
}