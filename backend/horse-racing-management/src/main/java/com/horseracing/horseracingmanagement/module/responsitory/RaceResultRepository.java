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
}