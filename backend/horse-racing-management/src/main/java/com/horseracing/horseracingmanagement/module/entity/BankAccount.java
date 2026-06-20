package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "bank_account")
public class BankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bank_account_id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 150)
    @NotNull
    @Column(name = "bank_name", nullable = false, length = 150)
    private String bankName;

    @Size(max = 150)
    @NotNull
    @Column(name = "bank_user_name", nullable = false, length = 150)
    private String bankUserName;

    @Size(max = 150)
    @NotNull
    @Column(name = "bank_number", nullable = false, length = 150)
    private String bankNumber;


}