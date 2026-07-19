package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.*;
import com.horseracing.horseracingmanagement.module.service.RefereeService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referee")
@RequiredArgsConstructor
@Tag(name = "Referee", description = "Referee management APIs")
public class RefereeController {

    private final RefereeService refereeService;

    // Complete profile
    @PutMapping("/complete-profile")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<RefereeProfileResponse>> completeProfile(
            @RequestBody CompleteRefereeProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Profile completed",
                refereeService.completeProfile(request, userDetails.getId())));
    }

    // Xem profile của mình
    @GetMapping("/me")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<RefereeProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getMyProfile(userDetails.getId())));
    }

    // Public — xem profile referee
    @GetMapping("/{refereeId}")
    public ResponseEntity<ApiResponse<RefereeProfileResponse>> getRefereeProfile(
            @PathVariable Long refereeId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getRefereeProfile(refereeId)));
    }

    // Race sắp tới
    @GetMapping("/my-upcoming-races")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<List<RefereeRaceResponse>>> getUpcomingRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getMyUpcomingRaces(userDetails.getId())));
    }

    // Race đang diễn ra
    @GetMapping("/my-current-races")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<List<RefereeRaceResponse>>> getCurrentRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getMyCurrentRaces(userDetails.getId())));
    }

    // Lịch sử race đã làm trọng tài
    @GetMapping("/my-race-history")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<List<RefereeRaceResponse>>> getRaceHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getMyRaceHistory(userDetails.getId())));
    }

    // Phát lệnh phạt
    @PostMapping("/penalty")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<PenaltyResponse>> issuePenalty(
            @Valid @RequestBody PenaltyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Penalty issued",
                        refereeService.issuePenalty(request, userDetails.getId())));
    }

    // Xem danh sách phạt trong 1 race
    @GetMapping("/penalty/race/{raceId}")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<List<PenaltyResponse>>> getPenaltiesByRace(
            @PathVariable Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getPenaltiesByRace(raceId)));
    }

    // Xem toàn bộ lịch sử phạt của referee
    @GetMapping("/penalty/my-history")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<List<PenaltyResponse>>> getMyPenaltyHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getMyPenaltyHistory(userDetails.getId())));
    }

    // Hủy lệnh phạt nếu nhầm
    @DeleteMapping("/penalty/{penaltyId}")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<String>> cancelPenalty(
            @PathVariable Long penaltyId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        refereeService.cancelPenalty(penaltyId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Penalty cancelled", null));
    }

    // Referee kiểm tra thông tin ngựa/jockey trước race
    @GetMapping("/inspect-race/{raceId}")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<PreRaceInspectionResponse>> inspectRace(
            @PathVariable Long raceId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Inspection complete",
                refereeService.inspectRace(raceId, userDetails.getId())));
    }

    // Referee báo cáo vấn đề phát hiện khi kiểm tra
    @PostMapping("/inspection-issue")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<String>> reportInspectionIssue(
            @Valid @RequestBody InspectionIssueRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        refereeService.reportInspectionIssue(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Issue reported", null));
    }

    // Referee tick/untick "OK" thủ công cho 1 ngựa sau khi kiểm tra trực tiếp
    @PutMapping("/verify-horse")
    @PreAuthorize("hasAuthority('REFEREE')")
    public ResponseEntity<ApiResponse<String>> verifyHorse(
            @Valid @RequestBody VerifyHorseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        refereeService.verifyHorse(request, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Horse verification updated", null));
    }

    // RefereeController — thêm endpoint (public)
    @GetMapping
    public ResponseEntity<ApiResponse<List<RefereeProfileResponse>>> getAllReferees() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                refereeService.getAllReferees()));
    }
}
