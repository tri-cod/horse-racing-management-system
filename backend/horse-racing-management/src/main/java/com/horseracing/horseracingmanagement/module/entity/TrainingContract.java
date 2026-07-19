package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "training_contract")
public class TrainingContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Trainer trainer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private HorseOwner owner;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "fee", nullable = false)
    private BigDecimal fee;  // tổng phí

    @Column(name = "fee_type", length = 20)
    private String feeType;  // MONTHLY, PERIOD

    @Column(name = "owner_note", columnDefinition = "TEXT")
    private String ownerNote;  // ghi chú từ owner khi gửi

    @Column(name = "trainer_note", columnDefinition = "TEXT")
    private String trainerNote;  // ghi chú từ trainer khi phản hồi

    @Column(name = "status", length = 30)
    private String status;
    // PENDING    → owner gửi, chờ trainer
    // ACCEPTED   → trainer chấp nhận, tiền bị giữ (escrow)
    // REJECTED   → trainer từ chối
    // ACTIVE     → đang trong thời gian train
    // COMPLETED  → hết hạn hợp đồng
    // CANCELLED  → owner hủy (trước khi trainer accept)

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;
}