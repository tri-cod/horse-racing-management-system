package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Builder @AllArgsConstructor @NoArgsConstructor @Getter @Setter
@Entity @Table(name = "race_result")
public class RaceResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @Column(name = "rank")
    private Long rank;

    @Column(name = "completiontime")
    private Instant completiontime;

    @ColumnDefault("0")
    @Builder.Default
    @Column(name = "rewards", nullable = false)
    private Long rewards = 0L;
}