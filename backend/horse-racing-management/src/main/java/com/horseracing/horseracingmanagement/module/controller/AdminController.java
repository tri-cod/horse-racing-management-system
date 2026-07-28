package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.RaceRevenueResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.UpdateUserRoleRequest;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.UpdateUserStatusRequest;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.AuthMeResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.RegisterRequest;
import com.horseracing.horseracingmanagement.module.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF')")
public class AdminController {

    private final AdminUserService adminUserService;

    // ============ USER MANAGEMENT ============
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserItemResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) RoleName role,
            @RequestParam(required = false) UserStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Users fetched",
                adminUserService.getUsers(page, size, keyword, role, status)));
    }
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    @Operation(summary = "create a new user account")
    public ResponseEntity<ApiResponse<AuthMeResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Register success", adminUserService.createUserAccout(request)));
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        adminUserService.updateRole(id, request.getRoleName());
        return ResponseEntity.ok(ApiResponse.success("User role updated", null));
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasAuthority('ADMIN')")   // ← STAFF từng thừa quyền này qua @PreAuthorize cấp class
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        adminUserService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully", null));
    }

    // ============ HORSE MANAGEMENT ============
    @DeleteMapping("/horses/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteHorse(@PathVariable Long id) {
        adminUserService.deleteHorse(id);
        return ResponseEntity.ok(ApiResponse.success("Horse banned successfully", null));
    }

    // ============ STATS ============
    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ADMIN')")   // ← số liệu tài chính toàn hệ thống, không mở cho STAFF
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
                adminUserService.getStats()));
    }

    // ============ REVENUE PER RACE ============
    // Ví dụ: GET /api/admin/stats/race-revenue?page=0&size=20&from=2026-01-01T00:00:00Z
    @GetMapping("/stats/race-revenue")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<RaceRevenueResponse>>> getRaceRevenue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return ResponseEntity.ok(ApiResponse.success(
                adminUserService.getRaceRevenue(page, size, from, to)));
    }
}
