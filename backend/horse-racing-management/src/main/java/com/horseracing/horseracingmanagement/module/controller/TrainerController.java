package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerListItemResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerStatsResponse;
import com.horseracing.horseracingmanagement.module.entity.Trainer;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.service.TrainerService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
@Tag(name = "Trainer", description = "Trainer management APIs")
public class TrainerController {

    private final TrainerService trainerService;
    private final TrainerRepository trainerRepository;

    @PutMapping("/complete-profile")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> completeProfile(
            @Valid @RequestBody CompleteTrainerProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile completed successfully",
                trainerService.completeProfile(request, userDetails.getId())));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<TrainerProfileResponse>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getProfile(userDetails.getId())));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<TrainerListItemResponse>>> getTrainerList() {
        List<Trainer> trainers = trainerRepository.findAll();
        List<TrainerListItemResponse> response = trainers.stream()
                .filter(t -> "Active".equalsIgnoreCase(t.getStatus()))
                .map(t -> {
                    String displayName = t.getName();
                    if (displayName == null && t.getUser() != null) {
                        displayName = t.getUser().getFullName() != null
                                ? t.getUser().getFullName()
                                : t.getUser().getUsername();
                    }
                    return TrainerListItemResponse.builder()
                            .id(t.getId())
                            .name(displayName)
                            .age(t.getAge())
                            .experienceYears(t.getExperienceYears())
                            .description(t.getDescription())
                            .avatarUrl(t.getAvatarUrl())
                            .status(t.getStatus())
                            .build();
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }
    @GetMapping("/my-race-history")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getMyRaceHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getMyRaceHistory(userDetails.getId())));
    }
    @GetMapping("/my-upcoming-races")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getUpcomingRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getUpcomingRaces(userDetails.getId())));
    }
    @GetMapping("/my-current-races")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getCurrentRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getCurrentRaces(userDetails.getId())));
    }


    @GetMapping("/{trainerId}/race-history")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getTrainerRaceHistory(
            @PathVariable Long trainerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getRaceHistoryById(trainerId)));
    }

    @GetMapping("/{trainerId}/upcoming-races")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getTrainerUpcomingRaces(
            @PathVariable Long trainerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getUpcomingRacesById(trainerId)));
    }

    @GetMapping("/{trainerId}/stats")
    public ResponseEntity<ApiResponse<TrainerStatsResponse>> getTrainerStats(
            @PathVariable Long trainerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                trainerService.getStats(trainerId)));
    }


}