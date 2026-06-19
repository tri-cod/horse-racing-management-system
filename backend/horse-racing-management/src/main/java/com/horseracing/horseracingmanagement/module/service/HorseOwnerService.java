package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.UpdateHorse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HorseOwnerService {
    SignHorseResponse signHorse(SignHorseRequest request, Long userId);
    SignHorseResponse assignTrainer(Long horseId, Long trainerId, Long userId);
    SignHorseResponse getHorse(Long horseId);
    List<SignHorseResponse> getHorseList(Long userId);
    SignHorseResponse updateHorse(Long horseId, UpdateHorse request, Long userId);
    void deleteHorse(Long horseId, Long userId);
}