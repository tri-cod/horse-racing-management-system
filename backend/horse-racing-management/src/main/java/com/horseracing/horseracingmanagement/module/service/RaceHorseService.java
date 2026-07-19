package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.WithdrawalRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyRequestDto;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetAllOddsRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetOddsRequest;
import com.horseracing.horseracingmanagement.module.entity.Jockey;
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
    List<JockeyResponse> getAvaiableJockeyList(Long raceId);

    RaceHorseResponse jockeyDecline(Long raceHorseId, Long userId);
    RaceHorseResponse jockeyAccept(Long raceHorseId, Long userId);
    RaceHorseResponse sendJockeyRequest(JockeyRequestDto request, Long userId);
    void cleanupPendingOnClose(Long raceId);
    List<RaceHorseResponse> getJockeyRequests(Long userId);
    RaceHorseResponse requestWithdrawal(WithdrawalRequest request, Long userId);
    RaceHorseResponse approveWithdrawal(Long raceHorseId);
    RaceHorseResponse rejectWithdrawal(Long raceHorseId);
    List<RaceHorseResponse> getWithdrawPending();

    // Same checks as the referee's pre-race inspection (horse fitness, jockey assigned/active,
    // odds set, no double-booked jockeys) — empty list means the race is clear to start.
    List<String> getPreRaceIssues(Long raceId);

}