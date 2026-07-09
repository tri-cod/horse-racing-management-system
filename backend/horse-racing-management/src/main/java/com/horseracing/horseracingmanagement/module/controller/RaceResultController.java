package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceResultResponse;
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

    // Referee set kết quả → system tự tính bet
    @PostMapping
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<String>> setRaceResult(
            @Valid @RequestBody SetRaceResultRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        raceResultService.setRaceResult(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(
                "Race result set. Betting results calculated!", null));
    }

    // Ai cũng xem được — kết quả 1 race (sort theo hạng)
    @GetMapping("/race/{raceId}")
    public ResponseEntity<ApiResponse<List<RaceResultResponse>>> getRaceResults(
            @PathVariable Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceResultService.getRaceResults(raceId)));
    }

    // Lịch sử đua của 1 horse (tất cả race đã tham gia)
    @GetMapping("/horse/{horseId}/history")
    public ResponseEntity<ApiResponse<List<RaceHistoryResponse>>> getHorseRaceHistory(
            @PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceResultService.getHorseRaceHistory(horseId)));
    }

    // Kết quả tốt nhất của 1 horse (hạng cao nhất từng đạt)
    @GetMapping("/horse/{horseId}/best")
    public ResponseEntity<ApiResponse<RaceHistoryResponse>> getHorseBestResult(
            @PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceResultService.getHorseBestResult(horseId)));
    }
}