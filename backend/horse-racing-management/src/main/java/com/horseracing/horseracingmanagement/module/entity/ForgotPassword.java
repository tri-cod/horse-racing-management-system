package com.horseracing.horseracingmanagement.module.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "forgot_password")
public class ForgotPassword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "otp")
    private String otp;

    @Column(name = "expiration_time")
    private LocalDateTime expiryDate;

    @OneToOne
    @JoinColumn(name ="user_id")
    private User user;
}
