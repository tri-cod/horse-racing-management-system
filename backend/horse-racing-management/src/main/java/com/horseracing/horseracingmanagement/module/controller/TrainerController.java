package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerListItemResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;
import com.horseracing.horseracingmanagement.module.entity.Trainer;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.service.TrainerService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

}