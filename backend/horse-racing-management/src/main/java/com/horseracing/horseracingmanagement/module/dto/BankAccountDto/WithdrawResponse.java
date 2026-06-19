package com.horseracing.horseracingmanagement.module.dto.BankAccountDto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class WithdrawResponse {
    private Long id;
    private Long amount;
    private String referenceCode;
    private String bankName;
    private String bankUserName;
    private String bankNumber;
    private String status;
    private Instant createdAt;
}
