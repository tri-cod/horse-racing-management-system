package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface JockeyService {
    JockeyProfileResponse completeProfile(CompleteJockeyProfileRequest request, Long userId);
    JockeyProfileResponse getMyProfile(Long userId);
    JockeyProfileResponse getJockeyProfile(Long jockeyId);  // public — user click xem
    List<JockeyProfileResponse> getAllJockeys();
    List<RaceParticipationResponse> getMyRaceHistory(Long userId);         // lịch sử đua
    List<RaceParticipationResponse> getUpcomingRaces(Long userId);         // trận sắp tới
    List<RaceParticipationResponse> getCurrentRaces(Long userId); // trận đang diễn ra
    List<RaceParticipationResponse> getRaceHistoryById(Long jockeyId);
    List<RaceParticipationResponse> getUpcomingRacesById(Long jockeyId);
    JockeyStatsResponse getStats(Long jockeyId);
}