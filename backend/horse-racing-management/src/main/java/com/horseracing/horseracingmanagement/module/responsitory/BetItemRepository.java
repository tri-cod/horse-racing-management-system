package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.BetItem;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface BetItemRepository extends JpaRepository<BetItem, Long> {
    List<BetItem> findByBet_Id(Long betId);
    List<BetItem> findByRaceHorse_Id(Long raceHorseId);

    @Query("SELECT SUM(bi.betAmount) FROM BetItem bi WHERE bi.raceHorse.id = :raceHorseId AND bi.resultStatus = 'PENDING'")
    BigDecimal getTotalBetAmountByRaceHorse(@Param("raceHorseId") Long raceHorseId);

    @Query("SELECT COUNT(bi) FROM BetItem bi WHERE bi.raceHorse.id = :raceHorseId AND bi.resultStatus = 'PENDING'")
    Long getTotalBetCountByRaceHorse(@Param("raceHorseId") Long raceHorseId);
}
