package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.RefereeDto.*;

import java.util.List;

public interface    RefereeService {
    RefereeProfileResponse completeProfile(CompleteRefereeProfileRequest request, Long userId);
    RefereeProfileResponse getMyProfile(Long userId);
    RefereeProfileResponse getRefereeProfile(Long refereeId);  // public

    // Race management
    List<RefereeRaceResponse> getMyUpcomingRaces(Long userId);   // race sắp tới
    List<RefereeRaceResponse> getMyCurrentRaces(Long userId);    // race đang diễn ra
    List<RefereeRaceResponse> getMyRaceHistory(Long userId);     // lịch sử race đã làm

    // Penalty
    PenaltyResponse issuePenalty(PenaltyRequest request, Long userId);
    List<PenaltyResponse> getPenaltiesByRace(Long raceId);
    List<PenaltyResponse> getMyPenaltyHistory(Long userId);      // tất cả lần phạt của referee
    void cancelPenalty(Long penaltyId, Long userId);             // hủy phạt nếu nhầm

    List<RefereeProfileResponse> getAllReferees();

    PreRaceInspectionResponse inspectRace(Long raceId, Long userId);
    void reportInspectionIssue(InspectionIssueRequest request, Long userId);
    void verifyHorse(VerifyHorseRequest request, Long userId);
}