package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.CreateBankAccountRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawRequest;
import com.horseracing.horseracingmanagement.module.dto.BankAccountDto.WithdrawResponse;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositRequest;
import com.horseracing.horseracingmanagement.module.dto.Deposit.DepositResponse;
import com.horseracing.horseracingmanagement.module.entity.BankAccount;
import com.horseracing.horseracingmanagement.module.entity.TransactionRequest;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.entity.Wallet;
import com.horseracing.horseracingmanagement.module.responsitory.BankAccountRepository;
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
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRequestRepository transactionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BankAccountRepository bankAccountRepository;


    @Transactional
    public DepositResponse createDepositRequest(DepositRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String referenceCode = "DEP" + userId + System.currentTimeMillis();
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

        BigDecimal amount = BigDecimal.valueOf(transaction.getAmount());

        // Ví user nhận tiền
        Wallet userWallet = walletRepository.findByUser_Id(transaction.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User wallet not found"));

        // Ví admin/hệ thống — tìm đúng cách, không hardcode id
        User adminUser = userRepository.findFirstByRole_Rolename(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        Wallet adminWallet = walletRepository.findByUser_Id(adminUser.getId())
                .orElseThrow(() -> new RuntimeException("Admin wallet not found"));

        // ← Check ví admin có đủ tiền để chi không
        if (adminWallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("System wallet has insufficient balance to approve this deposit");
        }

        // Trừ tiền ví admin, cộng tiền ví user
        adminWallet.setBalance(adminWallet.getBalance().subtract(amount));
        userWallet.setBalance(userWallet.getBalance().add(amount));

        walletRepository.save(adminWallet);
        walletRepository.save(userWallet);

        // Cập nhật transaction
        transaction.setRequestStatus("APPROVED");
        transaction.setVerifyNote(note);
        transaction.setProcessedby(staffUsername);
        transaction.setProcessedat(Instant.now());
        transactionRepository.save(transaction);

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



    // ===================== BANK ACCOUNT =====================

    @Override
    public BankAccount addBankAccount(CreateBankAccountRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BankAccount account = BankAccount.builder()
                .user(user)
                .bankName(request.getBankName())
                .bankUserName(request.getBankUserName())
                .bankNumber(request.getBankNumber())
                .build();

        return bankAccountRepository.save(account);
    }

    @Override
    public List<BankAccount> getMyBankAccounts(Long userId) {
        return bankAccountRepository.findByUser_Id(userId);
    }


    @Transactional
    public WithdrawResponse createWithdrawRequest(WithdrawRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BankAccount bankAccount = bankAccountRepository.findByIdAndUser_Id(
                        request.getBankAccountId(), userId)
                .orElseThrow(() -> new RuntimeException("Bank account not found or not yours"));

        BigDecimal amount = BigDecimal.valueOf(request.getAmount());

        Wallet userWallet = walletRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (userWallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // ← trừ tiền ngay để tránh user rút trùng/double-spend trong lúc chờ duyệt
        userWallet.setBalance(userWallet.getBalance().subtract(amount));
        walletRepository.save(userWallet);

        String referenceCode = "WD" + userId + System.currentTimeMillis();

        TransactionRequest transaction = TransactionRequest.builder()
                .user(user)
                .requestType("WITHDRAW")
                .amount(request.getAmount())
                .requestStatus("PENDING")
                .paymentMethod("BANK_TRANSFER")
                .referenceCode(referenceCode)
                .verifyNote(String.format("Bank: %s - %s - %s",
                        bankAccount.getBankName(),
                        bankAccount.getBankUserName(),
                        bankAccount.getBankNumber()))
                .build();

        transactionRepository.save(transaction);

        // Notify admin có yêu cầu rút tiền mới
        notificationService.sendToAllAdmins(
                "New Withdraw Request",
                String.format("User '%s' requested to withdraw %s", user.getUsername(), request.getAmount()),
                NotificationType.SYSTEM,
                transaction.getId()
        );

        return WithdrawResponse.builder()
                .id(transaction.getId())
                .amount(request.getAmount())
                .referenceCode(referenceCode)
                .bankName(bankAccount.getBankName())
                .bankUserName(bankAccount.getBankUserName())
                .bankNumber(bankAccount.getBankNumber())
                .status("PENDING")
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Transactional
    public void approveWithdraw(Long transactionId, String staffUsername, String note) {
        TransactionRequest transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getRequestStatus().equals("PENDING")) {
            throw new RuntimeException("Transaction already processed");
        }
        if (!transaction.getRequestType().equals("WITHDRAW")) {
            throw new RuntimeException("Transaction is not a withdraw request");
        }

        // Tiền đã bị trừ khỏi user khi tạo request → giờ chỉ cần đánh dấu APPROVED
        // Không cần động vào ví admin vì tiền này công ty CHUYỂN TIỀN THẬT ra ngoài (qua bank),
        // không phải tiền nội bộ hệ thống — nên KHÔNG cộng vào wallet admin.

        transaction.setRequestStatus("APPROVED");
        transaction.setVerifyNote(note);
        transaction.setProcessedby(staffUsername);
        transaction.setProcessedat(Instant.now());
        transactionRepository.save(transaction);

        notificationService.sendToUser(
                transaction.getUser().getId(),
                "Withdraw Approved!",
                String.format("Your withdrawal of %s has been processed and sent to your bank account!",
                        transaction.getAmount()),
                NotificationType.SYSTEM,
                transactionId
        );
    }

    @Transactional
    public void rejectWithdraw(Long transactionId, String staffUsername, String note) {
        TransactionRequest transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getRequestStatus().equals("PENDING")) {
            throw new RuntimeException("Transaction already processed");
        }
        if (!transaction.getRequestType().equals("WITHDRAW")) {
            throw new RuntimeException("Transaction is not a withdraw request");
        }

        // ← hoàn lại tiền cho user vì lúc tạo request đã trừ trước
        Wallet userWallet = walletRepository.findByUser_Id(transaction.getUser().getId())
                .orElseThrow(() -> new RuntimeException("User wallet not found"));
        userWallet.setBalance(userWallet.getBalance().add(BigDecimal.valueOf(transaction.getAmount())));
        walletRepository.save(userWallet);

        transaction.setRequestStatus("REJECTED");
        transaction.setVerifyNote(note);
        transaction.setProcessedby(staffUsername);
        transaction.setProcessedat(Instant.now());
        transactionRepository.save(transaction);

        notificationService.sendToUser(
                transaction.getUser().getId(),
                "Withdraw Rejected",
                String.format("Your withdrawal of %s was rejected and refunded. Reason: %s",
                        transaction.getAmount(), note),
                NotificationType.SYSTEM,
                transactionId
        );
    }



    // ===================== COMMON =====================


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

        public BigDecimal getBalance (Long userId){
            return walletRepository.findByUser_Id(userId)
                    .map(Wallet::getBalance)
                    .orElse(BigDecimal.ZERO);
        }
    }
