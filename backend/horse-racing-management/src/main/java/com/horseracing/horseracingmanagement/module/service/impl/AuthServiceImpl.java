package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.util.JwtUtil;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.*;
import com.horseracing.horseracingmanagement.module.entity.Role;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.RoleRepository;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl  implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final MailService emailService;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;
    private final EmailValidatorService  emailValidatorService;
    private final RedisTemplate<String, String> redisTemplate;


    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;



    // --- Email Verification ---
    public void sendEmailVerificationOtp(String email) {

        if (!emailValidatorService.isValidFormat(email)) {
            throw new RuntimeException("Email invalid");
        }

        if (!emailValidatorService.isDomainExists(email)) {
            throw new RuntimeException("Domain email does not exist");
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        String otp = otpService.generateAndStoreOtp(email, "VERIFY_EMAIL");
        emailService.sendOtpEmail(email, otp, "VERIFY_EMAIL");
    }


    // --- Forgot Password ---
    public void sendForgotPasswordOtp(String email) {

        if (!emailValidatorService.isValidFormat(email)) {
            throw new RuntimeException("Email invalid");
        }

        if (!emailValidatorService.isDomainExists(email)) {
            throw new RuntimeException("Domain email does not exist");
        }

        userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        // Optional: check if email exists in DB first
        String otp = otpService.generateAndStoreOtp(email, "FORGOT_PASSWORD");
        emailService.sendOtpEmail(email, otp, "FORGOT_PASSWORD");
    }

    public boolean verifyForgotPasswordOtp(String email, String otp) {
        if (userRepository.existsByEmail(email)) {
            throw new AppException("Email not found!", HttpStatus.CONFLICT);
        }
        return otpService.verifyOtp(email, "FORGOT_PASSWORD", otp);
        // On true → allow user to set a new password
    }

    // Check email đã verify chưa (dùng Redis)
    public boolean isEmailVerified(String email) {
        String key = "verified:" + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    // Khi verify OTP thành công → lưu trạng thái verified vào Redis
    public boolean verifyEmail(String email, String otp) {
        boolean valid = otpService.verifyOtp(email, "VERIFY_EMAIL", otp);
        if (valid) {
            // lưu trạng thái verified 10 phút (đủ để user điền form xong)
            redisTemplate.opsForValue().set("verified:" + email, "true", 10, TimeUnit.MINUTES);
        }
        return valid;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);
        AuthMeResponse currentUser = buildCurrentUser(userDetails.getId());
        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .user(currentUser)
                .build();
    }



    private AuthMeResponse buildCurrentUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        String role = user.getRole()
                .getRolename()
                .name();

        return AuthMeResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhonenumber())
                .avatar(user.getAvatarUrl())
                .role(role)
                .verified(user.isVerified())
                .status(user.getStatus().name())
                .build();
    }

    @Override
    public AuthMeResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email already in use", HttpStatus.CONFLICT);
        }

        Role role = roleRepository
                .findByRolename(request.getRole())
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        User user = User.builder().
                email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phonenumber(request.getPhone())
                .verified(false)
                .role(role).build();
        User saved = userRepository.save(user);
        return buildCurrentUser(saved.getId());
    }



    @Override
    public AuthMeResponse  resetPassword(ResetPasswordRequest request){
      User user =  userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

      user.setPassword(passwordEncoder.encode((request.getNewPassWord())));

        User.builder().
                email(request.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .phonenumber(user.getPhonenumber())
                .verified(true)
                .role(user.getRole()).build();

        User saved = userRepository.save(user);
        return   buildCurrentUser(saved.getId());
    }

    @Override
    public AuthMeResponse getMe(CustomUserDetails userDetails) {
        return buildCurrentUser(userDetails.getId());
    }
}
