package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.Bet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByUser_IdAndRace_Id(Long userId, Long raceId);  // ← thêm underscore
    List<Bet> findByRaceIdAndStatus(Long raceId, String status);
    List<Bet> findByUserId(Long userId);

}
