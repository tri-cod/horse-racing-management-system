package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface HorseOwnerService {
    SignHorseResponse signHorse(SignHorseRequest request, Long userId);
    SignHorseResponse assignTrainer(Long horseId, Long trainerId, Long userId);
    SignHorseResponse getHorse(Long horseId);
    List<SignHorseResponse> getHorseList(Long userId);
    List<SignHorseResponse> getAvailableHorseList(Long userId);
}