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

    @Size(max = 50)
    @Column(name = "full_name", length = 50)
    private String fullName;

    @NotNull
    @ColumnDefault("nextval('race_referee_experienceyears_seq')")
    @Column(name = "experienceyears", nullable = false)
    private Long experienceyears;

    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;


}