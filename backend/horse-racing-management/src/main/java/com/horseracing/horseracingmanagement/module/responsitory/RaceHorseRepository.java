package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Repository
public interface RaceHorseRepository extends JpaRepository<RaceHorse, Long> {
    // Check horse đã đăng ký race này chưa
    boolean existsByRace_IdAndHorse_Id(Long raceId, Long horseId);

    long countByRace_IdAndStatus(Long raceId, String status);

    List<RaceHorse> findByRace_Id(Long raceId);

    List<RaceHorse> findByHorse_OwnerId(Long ownerId);

    boolean existsByRace_IdAndJockey_Id(Long raceId, Long jockeyId);

    void deleteByRace_Id(Long raceId);

    List<RaceHorse> findByStatus(String status);

    @Query("SELECT rh.jockey.id FROM RaceHorse rh WHERE rh.race.id = :raceId AND rh.jockey IS NOT NULL")
    List<Long> findJockeyIdsByRaceId(@Param("raceId") Long raceId);

    @Query("SELECT rh.horse.id FROM RaceHorse rh WHERE rh.status IN ('Pending', 'Approved')")
    List<Long> findHorseIdsAlreadyInAnyRace();

    List<RaceHorse> findByHorse_Id(Long horseId);

    @Query("""

            SELECT rh.horse.id FROM RaceHorse rh
    WHERE rh.status IN ('Pending', 'Approved')
    AND rh.race.id != :raceId
    AND CAST(rh.race.startTime AS date) = CAST(:raceDate AS date)
    """)
    List<Long> findHorseIdsOnSameDay(
            @Param("raceId") Long raceId,
            @Param("raceDate") Instant raceDate);

    List<RaceHorse> findByJockey_IdAndStatus(Long jockeyId, String status);



    @Modifying
    @Transactional
    @Query(value = """
    DELETE FROM race_horse
    WHERE horse_id = :horseId
      AND race_id = :raceId
    """, nativeQuery = true)
    void deleteHorseFromRace(@Param("horseId") Long horseId,
                             @Param("raceId") Long raceId);

    // ← thêm
    List<RaceHorse> findByRace_IdAndStatusIn(Long raceId, List<String> statuses);
    List<RaceHorse> findByJockey_IdAndStatusIn(Long jockeyId, List<String> statuses);



    @Query("SELECT rh.horse.id FROM RaceHorse rh WHERE rh.race.id = :raceId")
    List<Long> findHorseIdsByRaceId(@Param("raceId") Long raceId);

    List<RaceHorse> findByJockey_Id(Long jockeyId);
    }// ← thêm (bỏ filter status để lấy hết)}