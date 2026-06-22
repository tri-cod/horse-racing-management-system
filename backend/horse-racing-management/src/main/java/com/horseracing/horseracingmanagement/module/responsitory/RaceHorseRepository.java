package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RaceHorseRepository extends JpaRepository<RaceHorse, Long> {
    // Check horse đã đăng ký race này chưa
    boolean existsByRace_IdAndHorse_Id(Long raceId, Long horseId);

    // Đếm số horse đã đăng ký trong race
    long countByRace_IdAndStatus(Long raceId, String status);

    // Lấy danh sách horse trong race
    List<RaceHorse> findByRace_Id(Long raceId);

    // Lấy danh sách race của 1 owner
    List<RaceHorse> findByHorse_OwnerId(Long ownerId);
    boolean existsByRace_IdAndJockey_Id(Long raceId, Long jockeyId);
    void deleteByRace_Id(Long raceId);

    // Lấy danh sách tất cả horse theo status (dùng cho admin duyệt)
    List<RaceHorse> findByStatus(String status);

    // Lấy danh sách jockeyId đã được assign trong 1 race cụ thể
    @Query("SELECT rh.jockey.id FROM RaceHorse rh WHERE rh.race.id = :raceId AND rh.jockey IS NOT NULL")
    List<Long> findJockeyIdsByRaceId(@Param("raceId") Long raceId);

    // Lấy danh sách horseId đã đăng ký vào BẤT KỲ race nào (chưa kết thúc)
    @Query("SELECT rh.horse.id FROM RaceHorse rh WHERE rh.status IN ('Pending', 'Approved')")
    List<Long> findHorseIdsAlreadyInAnyRace();
}