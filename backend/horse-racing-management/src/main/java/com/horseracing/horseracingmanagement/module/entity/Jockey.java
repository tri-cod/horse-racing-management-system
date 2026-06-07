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
@Table(name = "jockey")
public class Jockey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;  // ← thêm

    @Column(name = "age")
    private Long age;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "experience_year")
    private Long experienceYear;

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;
}