package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
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
@Table(name = "race_referee")
public class RaceReferee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "experienceyears")  // ← bỏ @NotNull + @ColumnDefault sequence
    private Long experienceyears;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;  // ← thêm

    @Column(name = "avatar_url")
    private String avatarUrl;  // ← thêm

    @Column(name = "cover_image_url")
    private String coverImageUrl;  // ← thêm

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;
}