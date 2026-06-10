package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.Bet.BetResponse;
import com.horseracing.horseracingmanagement.module.dto.Bet.CreateBetRequest;

import java.util.List;

public interface BetService {
    BetResponse placeBet(CreateBetRequest request, Long userId);
    void calculateBetResults(Long raceId);

    List<BetResponse> getMyBets(Long id);
}
