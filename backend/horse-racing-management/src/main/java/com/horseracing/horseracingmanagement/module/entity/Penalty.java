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
@Table(name = "penalty")
public class Penalty {
    @Id
    @Column(name = "penalty_id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('penalty_race_horse_id_seq')")
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;

    @Size(max = 255)
    @Column(name = "reason")
    private String reason;

    @Size(max = 50)
    @Column(name = "penalty_type", length = 50)
    private String penaltyType;

    @NotNull
    @ColumnDefault("nextval('penalty_amount_seq')")
    @Column(name = "amount", nullable = false)
    private Long amount;


}