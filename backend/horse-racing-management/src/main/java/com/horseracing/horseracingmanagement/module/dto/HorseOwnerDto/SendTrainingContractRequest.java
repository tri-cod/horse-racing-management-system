package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendTrainingContractRequest {
    @NotNull
    private Long horseId;
    @NotNull
    private Long trainerId;
    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;
    @NotNull
    private BigDecimal fee;          // giá owner đề xuất
    @NotNull
    private String feeType;          // MONTHLY hoặc PERIOD
    private String ownerNote;        // ghi chú thêm
}