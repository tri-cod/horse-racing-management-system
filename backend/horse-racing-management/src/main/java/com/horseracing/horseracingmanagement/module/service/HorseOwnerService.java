package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseRaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.*;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.PenaltyResponse;
import com.horseracing.horseracingmanagement.module.entity.Horse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public interface HorseOwnerService {
    SignHorseResponse signHorse(SignHorseRequest request, Long userId);
    SignHorseResponse getHorse(Long horseId);
    List<SignHorseResponse> getHorseList(Long userId);

    Page<SignHorseResponse> getHorseListWithFilter(String keyword, String status, Pageable pageable);
    List<SignHorseResponse> getAvailableHorseList(Long userId, Long raceId);
    List<HorseRaceHistoryResponse> getHorseRaceHistory(Long horseId);
    HorseRaceHistoryResponse getCurrentRace(Long horseId);

    List<HorseCurrentStatusResponse> getAllHorsesWithCurrentRace();
    SignHorseResponse updateHorse(Long horseId, UpdateHorse request, Long userId);
    void deleteHorse(Long horseId, Long userId);
    HorseCurrentStatusResponse mapToCurrentStatusResponse(Horse horse);
    void SendWithdrawalApplication (WithdrawalRequest with, Long userId);
    List<RaceParticipationResponse> getOwnerRaceHistory(Long userId); // lịch sử đua
    List<RaceParticipationResponse> getOwnerUpcomingRaces(Long userId); // trận sắp tới
    List<RaceParticipationResponse> getOwnerCurrentRaces(Long userId); // trận đang diễn ra
// Lịch sử đua của tất cả ngựa owner này sở hữu

    List<RaceParticipationResponse> getOwnerUpcomingRacesById(Long ownerId);
    List<RaceParticipationResponse> getOwnerRaceHistoryById(Long ownerId);
    List<SignHorseResponse> getHorsesByOwnerId(Long ownerId);
    OwnerStatsResponse getStats(Long ownerId);
    HorseOwnerProfileResponse completeProfile(CompleteHorseOwnerProfileRequest request, Long userId);
    HorseOwnerProfileResponse getMyProfile(Long userId);

    List<PenaltyResponse> getHorsePenalties(Long horseId, Long userId);
    List<PenaltyResponse> getMyPenalties(Long userId);

}