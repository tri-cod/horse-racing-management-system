package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RaceHorseService {
    RaceHorseResponse registerHorseToRace(RegisterRaceHorseRequest request, Long userId);
    List<RaceHorseResponse> getRaceHorseList(Long raceId);
    List<RaceHorseResponse> getMyHorseRaces(Long userId);
    RaceHorseResponse approveHorse(Long raceHorseId);    // Admin duyệt
    RaceHorseResponse rejectHorse(Long raceHorseId);     // Admin từ chối
}