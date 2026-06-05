package com.horseracing.horseracingmanagement.module.entity;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
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
@Table(name = "horse")
public class Horse {
    @Id
    @Column(name = "horse_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "trainer_id")
    private Long trainerId;

    @Column(name = "owner_id")
    private Long ownerId;

    @Size(max = 150)
    @NotNull
    @Column(name = "horse_name", nullable = false, length = 150)
    private String horseName;

    @Size(max = 50)
    @NotNull
    @Column(name = "breed", nullable = false, length = 50)
    private String breed;

    @NotNull
    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "speed_rating")
    private Integer speedRating;

    @Size(max = 50)
    @Column(name = "history_rank", length = 50)
    private String historyRank;

    @Size(max = 255)
    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "gender")
    private String gender;

    @Column(name = "weight")
    private Long weight;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @NotNull
    @ColumnDefault("'Active'")
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private HorseStatus status;


}