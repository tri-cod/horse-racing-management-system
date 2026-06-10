package com.horseracing.horseracingmanagement.module.dto.Deposit;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositRequest {
    @NotNull
    private Long amount;
    private String paymentMethod;  // QR_CODE
}