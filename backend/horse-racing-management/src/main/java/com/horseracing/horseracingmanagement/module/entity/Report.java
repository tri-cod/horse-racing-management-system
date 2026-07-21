package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "report")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;  // người báo cáo

    @Column(name = "target_type", length = 20, nullable = false)
    private String targetType;  // USER hoặc HORSE

    @Column(name = "target_id", nullable = false)
    private Long targetId;  // id của user hoặc horse bị báo cáo

    @Column(name = "target_name", length = 150)
    private String targetName;  // tên để dễ nhìn

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "detail", columnDefinition = "TEXT")
    private String detail;

    @Column(name = "status", length = 20)
    private String status;  // PENDING, REVIEWED, DISMISSED, ACTION_TAKEN

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;  // admin ghi chú khi xử lý

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;
}
