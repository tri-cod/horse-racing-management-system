package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;

public interface TrainerService {
    TrainerProfileResponse completeProfile(CompleteTrainerProfileRequest request, Long userId);
    TrainerProfileResponse getProfile(Long userId);
}
