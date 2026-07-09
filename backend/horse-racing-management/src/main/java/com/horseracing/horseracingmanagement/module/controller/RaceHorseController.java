package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetAllOddsRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetOddsRequest;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/race-horse")
@RequiredArgsConstructor
@Tag(name = "Race Horse", description = "Race Horse management APIs")
public class RaceHorseController {

    private final RaceHorseService raceHorseService;

    // HorseOwner đăng ký horse vào race
    @PostMapping("/register")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<RaceHorseResponse>> registerHorseToRace(
            @Valid @RequestBody RegisterRaceHorseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Horse registered to race successfully",
                        raceHorseService.registerHorseToRace(request, userDetails.getId())));
    }

    // Xem danh sách horse trong race (ai cũng xem được)
    @GetMapping("/race/{raceId}")
    public ResponseEntity<ApiResponse<List<RaceHorseResponse>>> getRaceHorseList(
            @PathVariable Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceHorseService.getRaceHorseList(raceId)));
    }

    // HorseOwner xem các race mà horse của mình đã đăng ký
    @GetMapping("/my-races")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<RaceHorseResponse>>> getMyHorseRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceHorseService.getMyHorseRaces(userDetails.getId())));
    }

    // Admin lấy danh sách ngựa đang chờ duyệt
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<List<RaceHorseResponse>>> getPendingHorses() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceHorseService.getPendingHorses()));
    }

    // Admin duyệt horse
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<RaceHorseResponse>> approveHorse(@PathVariable Long id) {

        return ResponseEntity.ok(ApiResponse.success("Horse approved",
                raceHorseService.approveHorse(id)));
    }

    // Admin từ chối horse
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<RaceHorseResponse>> rejectHorse(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Horse rejected",
                raceHorseService.rejectHorse(id)));
    }

    // Admin/Staff set odds
    @PutMapping("/odds")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> setOdds(
            @Valid @RequestBody SetAllOddsRequest request) {
        raceHorseService.setOdds(request);
        return ResponseEntity.ok(ApiResponse.success("Odds set successfully", null));
    }

    // Set odds cho 1 horse
    @PutMapping("/{id}/odds")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<RaceHorseResponse>> setOddsForOne(
            @PathVariable Long id,
            @RequestParam BigDecimal odds) {
        return ResponseEntity.ok(ApiResponse.success("Odds set successfully",
                raceHorseService.setOddsForOne(new SetOddsRequest(id, odds))));
    }
}