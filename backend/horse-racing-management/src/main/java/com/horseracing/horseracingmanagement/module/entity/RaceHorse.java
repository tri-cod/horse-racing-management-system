package com.horseracing.horseracingmanagement.module.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "race_horse")
public class RaceHorse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @JsonIgnore // tránh circular reference khi serialize JSON qua đường raceHorse.race
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jockey_id")  // ← nullable, assign sau
    private Jockey jockey;

    @Column(name = "lane_number")
    private Long laneNumber;

    @Column(name = "jockey_revenue_percent", precision = 5, scale = 2)
    private BigDecimal jockeyRevenuePercent;  // % Jockey được hưởng, ví dụ 10.00

    @Column(name = "owner_revenue_percent", precision = 5, scale = 2)
    private BigDecimal ownerRevenuePercent;

    @Column(name = "withdraw_reason", columnDefinition = "TEXT")
    private String withdrawReason;


    @Column(name = "start_position")
    private Long startPosition;

    @CreationTimestamp
    @Column(name = "register_at", updatable = false)
    private Instant registerAt;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "odds", precision = 10, scale = 2)
    private BigDecimal odds;
}