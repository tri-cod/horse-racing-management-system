package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetAllOddsRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetOddsRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface RaceHorseService {
    RaceHorseResponse registerHorseToRace(RegisterRaceHorseRequest request, Long userId);
    List<RaceHorseResponse> getRaceHorseList(Long raceId);
    List<RaceHorseResponse> getMyHorseRaces(Long userId);
    RaceHorseResponse approveHorse(Long raceHorseId);    // Admin duyệt
    RaceHorseResponse rejectHorse(Long raceHorseId);
    void setOdds(SetAllOddsRequest request);        // set odds cho tất cả horse
    RaceHorseResponse setOddsForOne(SetOddsRequest request);
    List<RaceHorseResponse> getPendingHorses(); // Admin lấy danh sách chờ duyệt
}