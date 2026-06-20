package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.CreateBankAccountRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawResponse;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositRequest;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositResponse;
import com.horseracing.horseracingmanagement.module.entity.BankAccount;

import java.math.BigDecimal;
import java.util.List;

public interface WalletService {
    DepositResponse createDepositRequest(DepositRequest request, Long userId);
    void approveDeposit(Long transactionId, String staffUsername, String note);
    void rejectDeposit(Long transactionId, String staffUsername, String note);
    String generateQrUrl(Long amount, String referenceCode);
    BigDecimal getAdminWallet();
    BigDecimal getBalance(Long id);


    //Bank
    BankAccount addBankAccount(CreateBankAccountRequest request, Long userId);
    List<BankAccount> getMyBankAccounts(Long userId);
    WithdrawResponse createWithdrawRequest(WithdrawRequest request, Long userId);
    void approveWithdraw(Long transactionId, String staffUsername, String note);
    void rejectWithdraw(Long transactionId, String staffUsername, String note);
}

