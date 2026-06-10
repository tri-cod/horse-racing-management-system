package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;
import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.service.RaceResultService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/race-results")
@RequiredArgsConstructor
public class RaceResultController {

    private final RaceResultService raceResultService;
    private final RaceResultRepository raceResultRepository;

    @PostMapping
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<String>> setRaceResult(
            @Valid @RequestBody SetRaceResultRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        raceResultService.setRaceResult(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(
                "Race result set. Betting results calculated!", null));
    }

    @GetMapping("/race/{raceId}")
    public ResponseEntity<ApiResponse<List<RaceResult>>> getRaceResults(
            @PathVariable Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceResultRepository.findByRace_IdOrderByRankAsc(raceId)));
    }
}