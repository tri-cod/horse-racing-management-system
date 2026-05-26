package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "bet_items")
public class BetItem {
    @Id
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('bet_items_bet_id_seq')")
    @JoinColumn(name = "bet_id", nullable = false)
    private Bet bet;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @ColumnDefault("nextval('bet_items_race_horse_id_seq')")
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;

    @NotNull
    @ColumnDefault("nextval('bet_items_bet_amount_seq')")
    @Column(name = "bet_amount", nullable = false)
    private Long betAmount;

    @NotNull
    @Column(name = "odds", nullable = false, precision = 10, scale = 2)
    private BigDecimal odds;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'Pending'")
    @Column(name = "result_status", nullable = false, length = 20)
    private String resultStatus;


}