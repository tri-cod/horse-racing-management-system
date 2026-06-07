package com.horseracing.horseracingmanagement.module.entity;

import com.horseracing.horseracingmanagement.common.constant.NoiStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // ← người nhận notification

    @Size(max = 150)
    @NotNull
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Size(max = 255)
    @NotNull
    @Column(name = "content", nullable = false)
    private String content;

    @Column(name = "is_read")
    private Boolean isRead = false;  // ← thêm

    @Column(name = "type", length = 50)
    private NoiStatus type;  // ← thêm: RACE_REGISTRATION, APPROVED, REJECTED

    @Column(name = "reference_id")
    private Long referenceId;  // ← id của RaceHorse để admin biết duyệt cái nào

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
}