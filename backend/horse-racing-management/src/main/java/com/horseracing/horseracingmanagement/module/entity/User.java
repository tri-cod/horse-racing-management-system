package com.horseracing.horseracingmanagement.module.entity;

import com.horseracing.horseracingmanagement.common.constant.UserStatus;
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
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Size(max = 150)
    @NotNull
    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Size(max = 150)
    @NotNull
    @Column(name = "username", nullable = false, length = 150)
    private String username;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    private String password;

    @Size(max = 150)
    @Column(name = "full_name", length = 150)
    private String fullName;

    @Size(max = 20)
    @Column(name = "phonenumber", length = 20)
    private String phonenumber;

    @Size(max = 255)
    @Column(name = "avatar_url")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @ColumnDefault("'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;


}