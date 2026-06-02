package com.horseracing.horseracingmanagement.module.dto.AdminDto;

import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
 public class UpdateUserStatusRequest {
    @NotNull
    private UserStatus status;
}
