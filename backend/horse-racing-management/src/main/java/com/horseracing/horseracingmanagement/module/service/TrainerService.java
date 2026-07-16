package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;

import java.util.List;

public interface TrainerService {
    TrainerProfileResponse completeProfile(CompleteTrainerProfileRequest request, Long userId);
    TrainerProfileResponse getProfile(Long userId);
    List getMyRaceHistory(Long userId); // lịch sử đua
    List getUpcomingRaces(Long userId); // trận sắp tới
    List getCurrentRaces(Long userId);

}
