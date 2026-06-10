package com.horseracing.horseracingmanagement.module.dto.Deposit;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DepositResponse {
    private Long id;
    private Long amount;
    private String referenceCode;  // mã ghi chú
    private String qrUrl;          // QR code url
    private String status;
    private Instant createdAt;
}