package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RaceResultRepository extends JpaRepository<RaceResult, Long> {
    // JOIN FETCH toàn bộ chain lazy (raceHorse → horse, jockey → user)
    // để tránh LazyInitializationException khi serialize JSON trả về frontend
    @Query("SELECT r FROM RaceResult r " +
           "JOIN FETCH r.raceHorse rh " +
           "JOIN FETCH rh.horse " +
           "LEFT JOIN FETCH rh.jockey j " +
           "LEFT JOIN FETCH j.user " +
           "WHERE r.race.id = :raceId " +
           "ORDER BY r.rank ASC")
    List<RaceResult> findByRace_IdOrderByRankAsc(@Param("raceId") Long raceId);

    Optional<RaceResult> findByRaceHorse_Id(Long raceHorseId);
    void deleteByRace_Id(Long raceId);

    // Lịch sử đua của 1 horse, sort theo thời gian race mới nhất
    @Query("""
        SELECT rr FROM RaceResult rr
        WHERE rr.raceHorse.horse.id = :horseId
        ORDER BY rr.race.startTime DESC
        """)
    List<RaceResult> findByHorseIdOrderByRaceDesc(@Param("horseId") Long horseId);

    /** Tổng tiền thưởng ngựa đã kiếm được trong sự nghiệp */
    @Query("SELECT COALESCE(SUM(rr.rewards), 0) FROM RaceResult rr " +
            "WHERE rr.raceHorse.horse.id = :horseId")
    Long sumRewardsByHorseId(@Param("horseId") Long horseId);

    /** Số lần về nhất — dùng để check điều kiện MAIDEN */
    @Query("SELECT COUNT(rr) FROM RaceResult rr " +
            "WHERE rr.raceHorse.horse.id = :horseId AND rr.rank = 1")
    long countWinsByHorseId(@Param("horseId") Long horseId);

    // Đếm số ngựa tham gia trong 1 race (dùng để tính tổng participant)
    long countByRace_Id(Long raceId);

}