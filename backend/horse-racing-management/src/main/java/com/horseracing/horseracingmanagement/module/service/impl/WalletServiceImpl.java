package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositRequest;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositResponse;
import com.horseracing.horseracingmanagement.module.entity.TransactionRequest;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.entity.Wallet;
import com.horseracing.horseracingmanagement.module.responsitory.TransactionRequestRepository;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.responsitory.WalletRepository;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.WalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRequestRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // User tạo đơn nạp tiền → sinh QR + mã ghi chú
    @Transactional
    public DepositResponse createDepositRequest(DepositRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Sinh mã ghi chú unique
        String referenceCode = "DEP" + userId + System.currentTimeMillis();

        // Tạo QR URL (dùng VietQR hoặc bất kỳ QR service nào)
        String qrUrl = generateQrUrl(request.getAmount(), referenceCode);

        TransactionRequest transaction = TransactionRequest.builder()
                .user(user)
                .requestType("DEPOSIT")
                .amount(request.getAmount())
                .requestStatus("PENDING")
                .paymentMethod(request.getPaymentMethod())
                .referenceCode(referenceCode)
                .qrUrl(qrUrl)
                .build();

        transactionRepository.save(transaction);

        return DepositResponse.builder()
                .id(transaction.getId())
                .amount(request.getAmount())
                .referenceCode(referenceCode)
                .qrUrl(qrUrl)
                .status("PENDING")
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    // Staff duyệt đơn nạp tiền
    @Transactional
    public void approveDeposit(Long transactionId, String staffUsername, String note) {
        TransactionRequest transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getRequestStatus().equals("PENDING")) {
            throw new RuntimeException("Transaction already processed");
        }

        // Cộng tiền vào wallet
        Wallet wallet = walletRepository.findByUser_Id(transaction.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));


        Wallet adminWallet = walletRepository.findByUser_Id(Long.valueOf(15)).orElseThrow(() -> new RuntimeException("Wallet not found"));

        adminWallet.setBalance(wallet.getBalance()
                .add(BigDecimal.valueOf(transaction.getAmount())));
        walletRepository.save(adminWallet);

        wallet.setBalance(wallet.getBalance()
                .add(BigDecimal.valueOf(transaction.getAmount())));
        walletRepository.save(wallet);

        // Cập nhật transaction
        transaction.setRequestStatus("APPROVED");
        transaction.setVerifyNote(note);
        transaction.setProcessedby(staffUsername);
        transaction.setProcessedat(Instant.now());
        transactionRepository.save(transaction);

        // Gửi notification cho user
        notificationService.sendToUser(
                transaction.getUser().getId(),
                "Deposit Approved!",
                String.format("Your deposit of %s has been approved. Balance updated!",
                        transaction.getAmount()),
                NotificationType.SYSTEM,
                transactionId
        );
    }

    // Staff từ chối đơn nạp tiền
    @Transactional
    public void rejectDeposit(Long transactionId, String staffUsername, String note) {
        TransactionRequest transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        transaction.setRequestStatus("REJECTED");
        transaction.setVerifyNote(note);
        transaction.setProcessedby(staffUsername);
        transaction.setProcessedat(Instant.now());
        transactionRepository.save(transaction);

        notificationService.sendToUser(
                transaction.getUser().getId(),
                "Deposit Rejected",
                String.format("Your deposit of %s was rejected. Reason: %s",
                        transaction.getAmount(), note),
                NotificationType.SYSTEM,
                transactionId
        );
    }

    // Sinh QR URL dùng VietQR
    public String generateQrUrl(Long amount, String referenceCode) {
        String bankId = "MB";        // ← đổi thành bank của bạn
        String accountNo = "0937385989";  // ← số tài khoản
        return String.format(
                "https://img.vietqr.io/image/%s-%s-compact.png?amount=%s&addInfo=%s",
                bankId, accountNo, amount, referenceCode
        );
    }

    @Override
    public BigDecimal getAdminWallet() {
       Optional<User> user = userRepository.findFirstByRole_Rolename(RoleName.ADMIN);
       return walletRepository.findByUser_Id(user.get().getId())
               .map(Wallet::getBalance)
               .orElse(BigDecimal.ZERO);
    }


    public BigDecimal getBalance(Long userId) {
        return walletRepository.findByUser_Id(userId)
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);
    }
}