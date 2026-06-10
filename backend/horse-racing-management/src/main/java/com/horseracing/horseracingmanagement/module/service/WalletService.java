package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositRequest;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositResponse;

import java.math.BigDecimal;

public interface WalletService {
    DepositResponse createDepositRequest(DepositRequest request, Long userId);
    void approveDeposit(Long transactionId, String staffUsername, String note);
    void rejectDeposit(Long transactionId, String staffUsername, String note);
    String generateQrUrl(Long amount, String referenceCode);

    BigDecimal getBalance(Long id);
}
