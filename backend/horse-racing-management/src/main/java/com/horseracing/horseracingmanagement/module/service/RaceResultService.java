package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;

public interface RaceResultService {
    void setRaceResult(SetRaceResultRequest request, Long userId);

}
