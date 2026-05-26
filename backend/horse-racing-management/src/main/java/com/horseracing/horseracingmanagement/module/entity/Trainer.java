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
@Table(name = "trainer")
public class Trainer {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 150)
    @NotNull
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotNull
    @ColumnDefault("nextval('trainer_age_seq')")
    @Column(name = "age", nullable = false)
    private Long age;

    @NotNull
    @ColumnDefault("nextval('trainer_experience_years_seq')")
    @Column(name = "experience_years", nullable = false)
    private Long experienceYears;

    @Size(max = 20)
    @ColumnDefault("'Active'")
    @Column(name = "status", length = 20)
    private String status;


}