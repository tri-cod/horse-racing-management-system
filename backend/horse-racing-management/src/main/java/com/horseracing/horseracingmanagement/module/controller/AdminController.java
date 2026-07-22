package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.UpdateUserRoleRequest;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.UpdateUserStatusRequest;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.PenaltyResponse;
import com.horseracing.horseracingmanagement.module.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        adminUserService.updateRole(id, request.getRoleName());
        return ResponseEntity.ok(ApiResponse.success("User role updated", null));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        adminUserService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
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
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats fetched",
                adminUserService.getStats()));
    }

    // ============ PENALTIES ============
    // Giám sát toàn bộ phạt trong hệ thống — theo dõi hành vi của referee
    @GetMapping("/penalties")
    public ResponseEntity<ApiResponse<List<PenaltyResponse>>> getAllPenalties() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                adminUserService.getAllPenalties()));
    }
}
