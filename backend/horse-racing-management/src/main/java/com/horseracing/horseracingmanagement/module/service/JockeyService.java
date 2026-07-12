package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface JockeyService {
    JockeyProfileResponse completeProfile(CompleteJockeyProfileRequest request, Long userId);
    JockeyProfileResponse getMyProfile(Long userId);
    JockeyProfileResponse getJockeyProfile(Long jockeyId);  // public — user click xem
    List<JockeyProfileResponse> getAllJockeys();
}