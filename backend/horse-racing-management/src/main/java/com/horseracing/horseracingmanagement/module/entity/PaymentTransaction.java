package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('payment_transaction_request_id_seq')")
    @JoinColumn(name = "request_id", nullable = false)
    private TransactionRequest request;

    @Size(max = 20)
    @Column(name = "transaction_type", length = 20)
    private String transactionType;

    @Size(max = 20)
    @NotNull
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "completed_at")
    private Instant completedAt;


}