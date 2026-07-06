package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.AuthDto.*;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    AuthMeResponse register(RegisterRequest request);

    AuthMeResponse getMe(CustomUserDetails userDetails);

    void logout(String token);

    void sendEmailVerificationOtp(String email);

    boolean verifyEmail(String email, String otp);

    void sendForgotPasswordOtp(String email);

    boolean verifyForgotPasswordOtp(String email, String otp);

    boolean isEmailVerified(String email);

    AuthMeResponse resetPassword(ResetPasswordRequest request);

    AuthMeResponse updateProfile(UpdateProfileRequest request, Long id);
}
