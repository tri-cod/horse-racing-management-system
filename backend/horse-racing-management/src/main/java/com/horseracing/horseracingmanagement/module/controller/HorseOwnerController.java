package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horse-owner")
@RequiredArgsConstructor
@Tag(name = "Horse Owner", description = "Horse Owner management APIs")
public class HorseOwnerController {

    private final HorseOwnerService horseOwnerService;

    @PostMapping("/horses")
    public ResponseEntity<ApiResponse<SignHorseResponse>> signHorse(
            @Valid @RequestBody SignHorseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ← lấy từ token

        System.out.println("userId từ token: " + userDetails.getId()); // ← thêm dòng này
        System.out.println("username từ token: " + userDetails.getUsername());

        Long userId = userDetails.getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Horse registered successfully",
                        horseOwnerService.signHorse(request, userId)));
    }

    @PutMapping("/horses/{horseId}/assign-trainer")
    public ResponseEntity<ApiResponse<SignHorseResponse>> assignTrainer(
            @PathVariable Long horseId,
            @RequestParam Long trainerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Trainer assigned successfully",
                horseOwnerService.assignTrainer(horseId, trainerId, userId)));
    }

    @GetMapping("/horses/{horseId}")
    public ResponseEntity<ApiResponse<SignHorseResponse>> getHorse(@PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorse(horseId)));
    }

    @GetMapping("/horses")
    public ResponseEntity<ApiResponse<List<SignHorseResponse>>> getHorseList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorseList(userId)));
    }
}