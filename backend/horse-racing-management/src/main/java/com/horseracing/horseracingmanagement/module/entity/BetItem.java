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
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bet_id", nullable = false)
    private Bet bet;  // ← bỏ @ColumnDefault sequence

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;  // ← bỏ @ColumnDefault sequence

    @Column(name = "bet_amount", nullable = false)
    private Long betAmount;  // ← bỏ @ColumnDefault sequence

    @Column(name = "odds", nullable = false, precision = 10, scale = 2)
    private BigDecimal odds;

    @Column(name = "result_status", nullable = false, length = 20)
    private String resultStatus;

    @Column(name = "payout", precision = 12, scale = 2)
    private BigDecimal payout;
}