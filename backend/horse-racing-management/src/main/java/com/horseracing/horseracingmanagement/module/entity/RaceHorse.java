package com.horseracing.horseracingmanagement.module.entity;

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
@Table(name = "race_horse")
public class RaceHorse {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('race_horse_race_id_seq')")
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('race_horse_horse_id_seq')")
    @JoinColumn(name = "horse_id", nullable = false)
    private Horse horse;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('race_horse_jockey_id_seq')")
    @JoinColumn(name = "jockey_id", nullable = false)
    private Jockey jockey;

    @NotNull
    @ColumnDefault("nextval('race_horse_lane_number_seq')")
    @Column(name = "lane_number", nullable = false)
    private Long laneNumber;

    @NotNull
    @ColumnDefault("nextval('race_horse_start_position_seq')")
    @Column(name = "start_position", nullable = false)
    private Long startPosition;

    @Column(name = "register_at")
    private Instant registerAt;

    @Size(max = 20)
    @ColumnDefault("'Actice'")
    @Column(name = "status", length = 20)
    private String status;


}