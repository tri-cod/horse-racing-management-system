package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.*;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final UserRepository userRepository;
    private final AuthService authService;


    @PostMapping("/send-verification-otp")
    public ResponseEntity<String> sendVerificationOtp(@RequestParam String email) {
        authService.sendEmailVerificationOtp(email);

        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String email,
                                              @RequestParam String otp) {
        boolean valid = authService.verifyEmail(email, otp);
        return valid
                ? ResponseEntity.ok("Email verified!")
                : ResponseEntity.badRequest().body("Invalid or expired OTP");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestParam String email) {
        authService.sendForgotPasswordOtp(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<String> verifyResetOtp(@RequestParam String email,
                                                 @RequestParam String otp) {
        boolean valid = authService.verifyForgotPasswordOtp(email, otp);
        return valid
                ? ResponseEntity.ok("OTP valid. Proceed to reset password.")
                : ResponseEntity.badRequest().body("Invalid or expired OTP");
    }



    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<AuthMeResponse>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest,
                                                                           @RequestParam String otp) {
        boolean valid = authService.verifyForgotPasswordOtp(resetPasswordRequest.email, otp);
        if (!valid) {
            return ResponseEntity.ok(ApiResponse.error("Invalid or expired OTP",authService.resetPassword(resetPasswordRequest)));
        }
        authService.resetPassword(resetPasswordRequest);
        return ResponseEntity.ok(ApiResponse.success("Reset password successfull", authService.resetPassword(resetPasswordRequest)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request )  {
        return ResponseEntity.ok(ApiResponse.success("Login succesfull", authService.login(request)));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthMeResponse>> register(@Valid @RequestBody RegisterRequest request) {

        if (!authService.isEmailVerified(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email not verify", null));
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Register success", authService.register(request)));
    }






}
