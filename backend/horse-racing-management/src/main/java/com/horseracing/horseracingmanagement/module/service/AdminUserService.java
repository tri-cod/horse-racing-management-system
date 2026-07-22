package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.PenaltyResponse;

import java.util.List;

public interface AdminUserService {
    PageResponse<AdminUserItemResponse> getUsers(int page, int size, String keyword, RoleName role, UserStatus status);
    void updateRole(Long userId, RoleName roleName);
    void updateStatus(Long userId, UserStatus status);

    void deleteHorse(Long horseId);         // ← thêm

    // Stats
    AdminStatsResponse getStats();

    // Giám sát toàn bộ phạt trong hệ thống, mới nhất trước
    List<PenaltyResponse> getAllPenalties();

}
