package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "wallet")
public class Wallet {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id", nullable = false)
    private User users;

    @NotNull
    @ColumnDefault("nextval('wallet_user_id_seq')")
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "balance", precision = 10, scale = 2)
    private BigDecimal balance;


}