package com.horseracing.horseracingmanagement.module.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

// RaceResult.java — đúng và đầy đủ
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "race_result")
public class RaceResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;

    @Column(name = "rank")
    private Long rank;

    @Column(name = "completion_time_seconds")
    private Double completionTimeSeconds;

    @Column(name = "rewards")
    private Long rewards;
}