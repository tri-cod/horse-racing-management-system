package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

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
    private Long id;

    @NotNull
    @Column(name = "trainer_id", nullable = false)
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

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'Active'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;


}