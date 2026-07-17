package com.horseracing.horseracingmanagement.module.entity;

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
@Table(name = "penalty")
public class Penalty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← fix: thêm auto generate
    @Column(name = "penalty_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_horse_id", nullable = false)  // ← bỏ @ColumnDefault sequence
    private RaceHorse raceHorse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referee_id", nullable = false)  // ← thêm: ai phạt
    private RaceReferee referee;

    @Size(max = 255)
    @Column(name = "reason")
    private String reason;

    @Column(name = "penalty_type", length = 50)
    private String penaltyType;  // FINE, DISQUALIFY, TIME_PENALTY, WARNING

    @Column(name = "amount")
    private Long amount;  // ← bỏ @ColumnDefault sequence, nullable

    @Column(name = "time_penalty_seconds")
    private Double timePenaltySeconds;  // ← thêm: phạt thêm giây vào thời gian đua

    @Column(name = "is_disqualified")
    private Boolean isDisqualified = false;  // ← thêm: disqualify khỏi race

    @CreationTimestamp
    @Column(name = "created_at")
    private Instant createdAt;
}