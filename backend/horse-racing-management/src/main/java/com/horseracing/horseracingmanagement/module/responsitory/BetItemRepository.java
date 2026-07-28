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
    void deleteByBet_Race_Id(Long raceId);

    @Query("SELECT COALESCE(SUM(bi.betAmount), 0) FROM BetItem bi WHERE bi.resultStatus = 'LOST'")
    BigDecimal sumLostBetAmount();

    @Query("SELECT SUM(bi.betAmount) FROM BetItem bi WHERE bi.raceHorse.id = :raceHorseId AND bi.resultStatus = 'PENDING'")
    BigDecimal getTotalBetAmountByRaceHorse(@Param("raceHorseId") Long raceHorseId);

    @Query("SELECT COUNT(bi) FROM BetItem bi WHERE bi.raceHorse.id = :raceHorseId AND bi.resultStatus = 'PENDING'")
    Long getTotalBetCountByRaceHorse(@Param("raceHorseId") Long raceHorseId);

    // ===== Doanh thu theo race =====

    /** Tổng tiền cược nhận vào của 1 race (mọi trạng thái trừ phiếu đã huỷ). */
    @Query("SELECT COALESCE(SUM(bi.betAmount), 0) FROM BetItem bi \n" +
            "WHERE bi.bet.race.id = :raceId AND bi.resultStatus <> 'CANCELLED'")
    BigDecimal sumHandleByRaceId(@Param("raceId") Long raceId);

    /** Tổng tiền đã trả cho phiếu thắng của 1 race. */
    @Query("SELECT COALESCE(SUM(bi.payout), 0) FROM BetItem bi \n" +
            "WHERE bi.bet.race.id = :raceId AND bi.resultStatus = 'WON'")
    BigDecimal sumPayoutByRaceId(@Param("raceId") Long raceId);
}
