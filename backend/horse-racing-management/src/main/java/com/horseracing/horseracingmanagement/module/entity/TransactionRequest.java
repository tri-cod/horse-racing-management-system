package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Builder @AllArgsConstructor @NoArgsConstructor @Getter @Setter
@Entity @Table(name = "transaction_request")
public class TransactionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "wallet", "role", "transactionRequests"})
    private User user;  // ← thêm user_id

    @Column(name = "request_type", length = 20)
    private String requestType;  // DEPOSIT, WITHDRAW

    @Column(name = "amount", nullable = false)
    private Long amount;

    @Column(name = "request_status", length = 20)
    private String requestStatus;  // PENDING, APPROVED, REJECTED

    @Column(name = "payment_method", length = 20)
    private String paymentMethod;  // QR_CODE, BANK_TRANSFER

    @Column(name = "reference_code", length = 50)
    private String referenceCode;  // ← mã ghi chú unique để đối soát

    @Column(name = "qr_url")
    private String qrUrl;  // ← url QR code

    @Column(name = "verify_note", length = 255)
    private String verifyNote;  // ← staff ghi chú khi duyệt

    @Column(name = "processedby", length = 50)
    private String processedby;

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "processedat")
    private Instant processedat;
}