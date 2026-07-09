package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceResultResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;

import java.util.List;

public interface RaceResultService {
    void setRaceResult(SetRaceResultRequest request, Long userId);
    List<RaceResultResponse> getRaceResults(Long raceId);        // kết quả 1 race
    List<RaceHistoryResponse> getHorseRaceHistory(Long horseId); // lịch sử 1 horse
    RaceHistoryResponse getHorseBestResult(Long horseId);
}
