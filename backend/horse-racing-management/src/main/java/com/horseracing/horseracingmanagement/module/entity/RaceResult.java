package com.horseracing.horseracingmanagement.module.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

@Builder @AllArgsConstructor @NoArgsConstructor @Getter @Setter
@Entity @Table(name = "race_result")
public class RaceResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_horse_id", nullable = false)
    private RaceHorse raceHorse;

    // @JsonIgnore: tránh circular reference khi serialize JSON (RaceResult → Race → RaceResult...)
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "race_id", nullable = false)
    private Race race;

    @Column(name = "rank")
    private Long rank;

    // Dùng String thay vì Instant vì frontend gửi chuỗi duration dạng "1:32.45", không phải timestamp
    @Column(name = "completiontime")
    private String completiontime;

    @ColumnDefault("0")
    @Builder.Default
    @Column(name = "rewards", nullable = false)
    private Long rewards = 0L;
}