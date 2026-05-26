package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Table(name = "transaction_request")
public class TransactionRequest {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'Pending'")
    @Column(name = "request_type", nullable = false, length = 20)
    private String requestType;

    @NotNull
    @ColumnDefault("nextval('transaction_request_amount_seq')")
    @Column(name = "amount", nullable = false)
    private Long amount;

    @Size(max = 20)
    @ColumnDefault("'Pending'")
    @Column(name = "request_status", length = 20)
    private String requestStatus;

    @Size(max = 20)
    @NotNull
    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    @Size(max = 20)
    @Column(name = "verify_note", length = 20)
    private String verifyNote;

    @Column(name = "created_at")
    private Instant createdAt;

    @Size(max = 50)
    @Column(name = "processedby", length = 50)
    private String processedby;

    @Column(name = "processedat")
    private Instant processedat;


}