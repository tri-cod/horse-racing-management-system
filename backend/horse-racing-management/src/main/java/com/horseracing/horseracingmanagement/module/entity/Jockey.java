package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "jockey")
public class Jockey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;  // ← thêm

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "experience_year")
    private Long experienceYear;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;
}