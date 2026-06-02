package com.horseracing.horseracingmanagement.module.dto.AdminDto;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class   UpdateUserRoleRequest {
    @NotNull
    private RoleName roleName;
}
