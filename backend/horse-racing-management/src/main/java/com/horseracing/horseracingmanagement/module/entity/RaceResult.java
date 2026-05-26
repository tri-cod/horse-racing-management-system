package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "race_result")
public class RaceResult {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id", nullable = false)
    private RaceHorse raceHorse;

    @NotNull
    @ColumnDefault("nextval('race_result_race_horse_id_seq')")
    @Column(name = "race_horse_id", nullable = false)
    private Long raceHorseId;

    @Column(name = "rank")
    private Long rank;

    @Column(name = "completiontime")
    private Instant completiontime;

    @NotNull
    @ColumnDefault("nextval('race_result_rewards_seq')")
    @Column(name = "rewards", nullable = false)
    private Long rewards;

    @NotNull
    @ColumnDefault("nextval('race_result_penalty_id_seq')")
    @Column(name = "penalty_id", nullable = false)
    private Long penaltyId;


}