package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RaceService {
    RaceResponse createRace(CreateRaceRequest request);
    RaceResponse closeRace(Long raceId);
    RaceResponse getRace(Long raceId);
    Page<RaceResponse> getRaceList(String status, Pageable pageable);
    RaceResponse updateRace(Long raceId, CreateRaceRequest request);
    void deleteRace(Long raceId);

    RaceResponse startRace(Long id);

    RaceResponse finishRace(Long id);
    RaceResponse reopenRace(Long raceId);
}
