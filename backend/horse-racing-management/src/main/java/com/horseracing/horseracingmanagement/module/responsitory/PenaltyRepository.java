package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, Long> {
    List<Penalty> findByRaceHorse_Race_Id(Long raceId);
    List<Penalty> findByRaceHorse_Id(Long raceHorseId);
    List<Penalty> findByReferee_Id(Long refereeId);
    long countByReferee_Id(Long refereeId);
    List<Penalty> findByRaceHorse_Race_IdAndReferee_Id(Long raceId, Long refereeId);
    void deleteByRaceHorse_Race_Id(Long raceId);
}