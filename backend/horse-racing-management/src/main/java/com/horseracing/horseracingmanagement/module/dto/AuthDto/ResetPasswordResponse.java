package com.horseracing.horseracingmanagement.module.dto.AuthDto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class ResetPasswordResponse {
    private String newPassword;
    private AuthMeResponse authMeResponse;
}
