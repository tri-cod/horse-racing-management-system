package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.CreateReportRequest;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.ReportResponse;
import com.horseracing.horseracingmanagement.module.responsitory.ReportRepository;
import com.horseracing.horseracingmanagement.module.service.AdminUserService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;



@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AdminUserService adminUserService;
    private final ReportRepository reportRepository;  // ← inject

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Report submitted",
                        adminUserService.createReport(request, userDetails.getId())));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ReportResponse> reports = reportRepository
                .findByReporter_Id(userDetails.getId())
                .stream()
                .map(r -> ReportResponse.builder()
                        .id(r.getId())
                        .reporterId(r.getReporter().getId())
                        .reporterName(r.getReporter().getFullName())
                        .targetType(r.getTargetType())
                        .targetId(r.getTargetId())
                        .targetName(r.getTargetName())
                        .reason(r.getReason())
                        .detail(r.getDetail())
                        .status(r.getStatus())
                        .adminNote(r.getAdminNote())
                        .createdAt(r.getCreatedAt())
                        .reviewedAt(r.getReviewedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Success", reports));
    }
}