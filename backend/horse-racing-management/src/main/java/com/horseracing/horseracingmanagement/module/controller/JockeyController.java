package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.entity.Jockey;
import com.horseracing.horseracingmanagement.module.responsitory.JockeyRepository;
import com.horseracing.horseracingmanagement.module.service.JockeyService;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jockeys")
@RequiredArgsConstructor
@Tag(name = "Jockey", description = "Jockey management APIs")
public class JockeyController {

    private final JockeyRepository jockeyRepository;
    private final RaceHorseService raceHorseService;
    private final JockeyService jockeyService;


    // Jockey complete profile sau khi register
    @PutMapping("/complete-profile")
    @PreAuthorize("hasAuthority('JOCKEY')")
    public ResponseEntity<ApiResponse<JockeyProfileResponse>> completeProfile(
            @RequestBody CompleteJockeyProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile completed",
                jockeyService.completeProfile(request, userDetails.getId())));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('JOCKEY')")
    public ResponseEntity<ApiResponse<JockeyProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getMyProfile(userDetails.getId())));
    }

    @GetMapping("/{jockeyId}")
    public ResponseEntity<ApiResponse<JockeyProfileResponse>> getJockeyProfile(
            @PathVariable Long jockeyId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getJockeyProfile(jockeyId)));
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<JockeyResponse>>> getJockeyList() {
        List<Jockey> jockeys = jockeyRepository.findByStatus("Active");
        List<JockeyResponse> response = jockeys.stream()
                .filter(j -> j.getUser() != null && j.getUser().getStatus() != UserStatus.BANNED)
                .map(j -> JockeyResponse.builder()
                        .id(j.getId())
                        .name(j.getUser().getFullName() != null
                                ? j.getUser().getFullName()
                                : j.getUser().getUsername())
                        .dateOfBirth(j.getDateOfBirth())
                        .experienceYear(j.getExperienceYear())
                        .status(j.getStatus())
                        .avatarUrl(j.getAvatarUrl())
                        .coverImageUrl(j.getCoverImageUrl())
                        .description(j.getDescription())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<JockeyResponse>>> getAvailableJockeys(
            @RequestParam Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceHorseService.getAvaiableJockeyList(raceId)));
    }
    @GetMapping("/my-race-history")
    @PreAuthorize("hasAuthority('JOCKEY')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getMyRaceHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getMyRaceHistory(userDetails.getId())));
    }
    @GetMapping("/my-upcoming-races")
    @PreAuthorize("hasAuthority('JOCKEY')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getUpcomingRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getUpcomingRaces(userDetails.getId())));
    }
    @GetMapping("/my-current-races")
    @PreAuthorize("hasAuthority('JOCKEY')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getCurrentRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getCurrentRaces(userDetails.getId())));
    }


    // Public — xem lịch sử đua của 1 jockey cụ thể (ai cũng xem được)
    @GetMapping("/{jockeyId}/race-history")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getJockeyRaceHistory(
            @PathVariable Long jockeyId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getRaceHistoryById(jockeyId)));
    }

    @GetMapping("/{jockeyId}/upcoming-races")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getJockeyUpcomingRaces(
            @PathVariable Long jockeyId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getUpcomingRacesById(jockeyId)));
    }

    @GetMapping("/{jockeyId}/stats")
    public ResponseEntity<ApiResponse<JockeyStatsResponse>> getJockeyStats(
            @PathVariable Long jockeyId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                jockeyService.getStats(jockeyId)));
    }



}