package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.AuthDto.AuthMeResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginRequest;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.RegisterRequest;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    AuthMeResponse register(RegisterRequest request);

    AuthMeResponse getMe(CustomUserDetails userDetails);
}
