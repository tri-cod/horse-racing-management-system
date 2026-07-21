package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.CreateReportRequest;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.ReportResponse;

import java.util.List;

public interface AdminUserService {
    PageResponse<AdminUserItemResponse> getUsers(int page, int size, String keyword, RoleName role, UserStatus status);
    void updateRole(Long userId, RoleName roleName);
    void updateStatus(Long userId, UserStatus status);

    void deleteUser(Long userId);           // ← thêm
    void deleteHorse(Long horseId);         // ← thêm

    // Report
    ReportResponse createReport(CreateReportRequest request, Long reporterId);
    List<ReportResponse> getPendingReports();
    ReportResponse reviewReport(Long reportId, String action, String adminNote, Long adminId);

    // Stats
    AdminStatsResponse getStats();


}
