package com.horseracing.horseracingmanagement.module.responsitory;


import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.entity.HorseOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HorseOwnerRepository extends JpaRepository<HorseOwner, Long> {

    Optional<HorseOwner> findByUserId(Long userId);

    Optional<HorseOwner> findById(Long id);

    @Query("SELECT new com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse(h.id, h.horseName, h.breed, h.avatarUrl, CAST(h.status AS string), rh.race.id, rh.race.raceName, CAST(rh.race.status AS string), rh.status) FROM Horse h LEFT JOIN RaceHorse rh ON rh.horse.id = h.id AND rh.race.status <> com.horseracing.horseracingmanagement.common.constant.RaceStatus.FINISHED")
    List<HorseCurrentStatusResponse> getAllHorsesWithCurrentRace();

    @Query("SELECT new com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse(h.id, h.horseName, h.breed, h.avatarUrl, CAST(h.status AS string), rh.race.id, rh.race.raceName, CAST(rh.race.status AS string), rh.status) FROM RaceHorse rh JOIN rh.horse h WHERE rh.race.id = :raceId")
    List<HorseCurrentStatusResponse> getHorsesByRaceId(@Param("raceId") Long raceId);
}
