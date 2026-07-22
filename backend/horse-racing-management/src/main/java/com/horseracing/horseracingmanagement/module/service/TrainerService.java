package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerStatsResponse;

import java.util.List;

public interface TrainerService {
    TrainerProfileResponse completeProfile(CompleteTrainerProfileRequest request, Long userId);
    TrainerProfileResponse getProfile(Long userId);
    List<RaceParticipationResponse> getMyRaceHistory(Long userId); // lịch sử đua
    List<RaceParticipationResponse> getUpcomingRaces(Long userId); // trận sắp tới
    List<RaceParticipationResponse> getCurrentRaces(Long userId);

    List<RaceParticipationResponse> getRaceHistoryById(Long trainerId);
    List<RaceParticipationResponse> getUpcomingRacesById(Long trainerId);
    TrainerStatsResponse getStats(Long trainerId);

    List<TrainerHorseResponse> getTrainerHorses(Long trainerId); // ngựa trainer đang huấn luyện
}
    