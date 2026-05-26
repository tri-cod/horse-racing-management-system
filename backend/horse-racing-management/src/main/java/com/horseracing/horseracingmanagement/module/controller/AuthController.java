package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.AuthMeResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginRequest;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.RegisterRequest;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request )  {
        return ResponseEntity.ok(ApiResponse.success("Login succesfull", authService.login(request)));
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthMeResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", authService.register(request)));
    }


}
