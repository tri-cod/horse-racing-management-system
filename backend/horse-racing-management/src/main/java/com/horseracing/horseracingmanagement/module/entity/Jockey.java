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
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 150)
    @Column(name = "name", length = 150)
    private String name;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @NotNull
    @ColumnDefault("nextval('jockey_age_seq')")
    @Column(name = "age", nullable = false)
    private Long age;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @ColumnDefault("nextval('jockey_experience_year_seq')")
    @Column(name = "experience_year", nullable = false)
    private Long experienceYear;

    @Size(max = 20)
    @ColumnDefault("'Active'")
    @Column(name = "status", length = 20)
    private String status;


}