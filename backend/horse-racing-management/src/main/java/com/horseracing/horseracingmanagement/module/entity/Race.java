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
@Table(name = "race")
public class Race {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('race_referee_id_seq1')")
    @JoinColumn(name = "referee_id", nullable = false)
    private RaceReferee referee;

    @Size(max = 150)
    @NotNull
    @Column(name = "race_name", nullable = false, length = 150)
    private String raceName;

    @Column(name = "race_date")
    private Instant raceDate;

    @Column(name = "start_time")
    private Instant startTime;

    @Column(name = "end_time")
    private Instant endTime;

    @Size(max = 150)
    @NotNull
    @Column(name = "track_name", nullable = false, length = 150)
    private String trackName;

    @Size(max = 50)
    @NotNull
    @Column(name = "track_condition", nullable = false, length = 50)
    private String trackCondition;

    @Size(max = 50)
    @Column(name = "surface_type", length = 50)
    private String surfaceType;

    @NotNull
    @ColumnDefault("nextval('race_totalprizepool_seq')")
    @Column(name = "totalprizepool", nullable = false)
    private Long totalprizepool;

    @NotNull
    @Column(name = "distance", nullable = false, length = Integer.MAX_VALUE)
    private String distance;

    @Size(max = 150)
    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "capacity")
    private Long capacity;

    @Size(max = 255)
    @Column(name = "banner_imageurl")
    private String bannerImageurl;

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;


}