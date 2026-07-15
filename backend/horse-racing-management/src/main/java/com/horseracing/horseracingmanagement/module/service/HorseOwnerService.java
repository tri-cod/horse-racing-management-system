package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseRaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.UpdateHorse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.WithdrawalRequest;
import com.horseracing.horseracingmanagement.module.entity.Horse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HorseOwnerService {
    SignHorseResponse signHorse(SignHorseRequest request, Long userId);
    SignHorseResponse assignTrainer(Long horseId, Long trainerId, Long userId);
    SignHorseResponse getHorse(Long horseId);
    List<SignHorseResponse> getHorseList(Long userId);

    Page<SignHorseResponse> getHorseListWithFilter(String keyword, String status, Pageable pageable);
    List<SignHorseResponse> getAvailableHorseList(Long userId, Long raceId);
    List<HorseRaceHistoryResponse> getHorseRaceHistory(Long horseId);
    HorseRaceHistoryResponse getCurrentRace(Long horseId);

    List<HorseCurrentStatusResponse> getAllHorsesWithCurrentRace();
    List<HorseCurrentStatusResponse> getHorsesByRaceId(Long raceId);
    SignHorseResponse updateHorse(Long horseId, UpdateHorse request, Long userId);
    void deleteHorse(Long horseId, Long userId);
    HorseCurrentStatusResponse mapToCurrentStatusResponse(Horse horse);
    void SendWithdrawalApplication (WithdrawalRequest with, Long userId);
}