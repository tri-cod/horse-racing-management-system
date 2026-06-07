package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // ← bỏ optional = false, nullable
    @JoinColumn(name = "referee_id")
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
    @Column(name = "track_name", length = 150)  // ← bỏ NotNull
    private String trackName;

    @Size(max = 50)
    @Column(name = "track_condition", length = 50)  // ← bỏ NotNull
    private String trackCondition;

    @Size(max = 50)
    @Column(name = "surface_type", length = 50)
    private String surfaceType;

    @Column(name = "totalprizepool")  // ← bỏ NotNull và ColumnDefault sequence
    private Long totalprizepool;

    @Column(name = "distance", length = Integer.MAX_VALUE)  // ← bỏ NotNull
    private String distance;

    @Size(max = 150)
    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "capacity")
    private Long capacity;

    @Size(max = 255)
    @Column(name = "banner_imageurl")
    private String bannerImageurl;

    @Column(name = "registration_deadline")
    private Instant registrationDeadline;  // ← hạn đăng ký

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}