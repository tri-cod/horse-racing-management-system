package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.CreateBankAccountRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawResponse;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositRequest;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositResponse;
import com.horseracing.horseracingmanagement.module.entity.BankAccount;
import com.horseracing.horseracingmanagement.module.entity.TransactionRequest;
import com.horseracing.horseracingmanagement.module.responsitory.TransactionRequestRepository;
import com.horseracing.horseracingmanagement.module.service.WalletService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final TransactionRequestRepository transactionRepository;

    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<BigDecimal>> getBalance(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                walletService.getBalance(userDetails.getId())));
    }

    @GetMapping("/balance/system")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<BigDecimal>> getSystemBalance(
            @AuthenticationPrincipal CustomUserDetails userDetails){
        return  ResponseEntity.ok(ApiResponse.success("Success",
                walletService.getAdminWallet()));
    }


    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<DepositResponse>> createDeposit(
            @Valid @RequestBody DepositRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Deposit request created",
                        walletService.createDepositRequest(request, userDetails.getId())));
    }

    // Staff duyệt đơn nạp tiền
    @PutMapping("/deposit/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> approveDeposit(
            @PathVariable Long id,
            @RequestParam String note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        walletService.approveDeposit(id, userDetails.getUsername(), note);
        return ResponseEntity.ok(ApiResponse.success("Deposit approved", null));
    }

    @PutMapping("/deposit/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> rejectDeposit(
            @PathVariable Long id,
            @RequestParam String note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        walletService.rejectDeposit(id, userDetails.getUsername(), note);
        return ResponseEntity.ok(ApiResponse.success("Deposit rejected", null));
    }

    // Staff xem danh sách đơn pending
    @GetMapping("/deposit/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<TransactionRequest>>> getPendingDeposits() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                transactionRepository.findByRequestStatus("PENDING")));
    }

    // Thêm vào WalletController

    @PostMapping("/bank-accounts")
    public ResponseEntity<ApiResponse<BankAccount>> addBankAccount(
            @Valid @RequestBody CreateBankAccountRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bank account added",
                        walletService.addBankAccount(request, userDetails.getId())));
    }

    @GetMapping("/bank-accounts")
    public ResponseEntity<ApiResponse<List<BankAccount>>> getMyBankAccounts(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                walletService.getMyBankAccounts(userDetails.getId())));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<WithdrawResponse>> createWithdraw(
            @Valid @RequestBody WithdrawRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Withdraw request created",
                        walletService.createWithdrawRequest(request, userDetails.getId())));
    }

    @PutMapping("/withdraw/{id}/approve")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> approveWithdraw(
            @PathVariable Long id,
            @RequestParam String note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        walletService.approveWithdraw(id, userDetails.getUsername(), note);
        return ResponseEntity.ok(ApiResponse.success("Withdraw approved", null));
    }

    @PutMapping("/withdraw/{id}/reject")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> rejectWithdraw(
            @PathVariable Long id,
            @RequestParam String note,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        walletService.rejectWithdraw(id, userDetails.getUsername(), note);
        return ResponseEntity.ok(ApiResponse.success("Withdraw rejected", null));
    }

    @GetMapping("/withdraw/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<TransactionRequest>>> getPendingWithdraws() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                transactionRepository.findByRequestTypeAndRequestStatus("WITHDRAW", "PENDING")));
    }


}