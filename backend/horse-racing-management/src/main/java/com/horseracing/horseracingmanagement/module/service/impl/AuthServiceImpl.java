package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.util.JwtUtil;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.*;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import com.horseracing.horseracingmanagement.module.service.impl.emailOTP.EmailValidatorService;
import com.horseracing.horseracingmanagement.module.service.impl.emailOTP.MailService;
import com.horseracing.horseracingmanagement.module.service.impl.emailOTP.OtpService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
@Slf4j

public class AuthServiceImpl  implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final HorseOwnerRepository horseOwnerRepository;
    private final TrainerRepository trainerRepository;
    private final AuthenticationManager authenticationManager;
    private final MailService emailService;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;
    private final EmailValidatorService emailValidatorService;
    private final RedisTemplate<String, String> redisTemplate;
    private final JockeyRepository jockeyRepository;


    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;



    // --- Email Verification ---c
    public void sendEmailVerificationOtp(String email) {
        log.info("→ Checking email format: {}", email);

        if (!emailValidatorService.isValidFormat(email)) {
            log.warn("Invalid email format: {}", email);
            throw new RuntimeException("Email invalid");
        }

        log.info("→ Checking domain exists for: {}", email);

        if (!emailValidatorService.isDomainExists(email)) {
            log.warn("Domain does not exist for: {}", email);
            throw new RuntimeException("Domain email does not exist");
        }

        log.info("→ Generating OTP for: {}", email);
        String otp = otpService.generateAndStoreOtp(email, "VERIFY_EMAIL");

        log.info("→ Sending OTP email to: {}", email);
        emailService.sendOtpEmail(email, otp, "VERIFY_EMAIL");

        log.info("✓ OTP sent successfully to: {}", email);
    }

    // --- Forgot Password ---
    public void sendForgotPasswordOtp(String email) {

        if (!emailValidatorService.isValidFormat(email)) {
            throw new RuntimeException("Email invalid");
        }

        if (!emailValidatorService.isDomainExists(email)) {
            throw new RuntimeException("Domain email does not exist");
        }

        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email not found in system");
        }

        // Optional: check if email exists in DB first
        String otp = otpService.generateAndStoreOtp(email, "FORGOT_PASSWORD");
        emailService.sendOtpEmail(email, otp, "FORGOT_PASSWORD");
    }

    public boolean verifyForgotPasswordOtp(String email, String otp) {
        return otpService.verifyOtp(email, "FORGOT_PASSWORD", otp);
        // On true → allow user to set a new password
    }

    public boolean isEmailVerified(String email) {
        String key = "verified:" + email;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public boolean verifyEmail(String email, String otp) {
        boolean valid = otpService.verifyOtp(email, "VERIFY_EMAIL", otp);
        if (valid) {

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
                .balance(user.getWallet() == null ? BigDecimal.ZERO : user.getWallet().getBalance())
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


        Wallet wallet = new Wallet();
        wallet.setBalance(BigDecimal.ZERO);

        User user = User.builder().
                email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phonenumber(request.getPhone())
                .verified(true)
                .createdAt(Instant.now())
                .role(role).build();

        user.setWallet(wallet);
        wallet.setUser(user);

        User saved = userRepository.save(user);

        if (role.getRolename().name().equals("TRAINER")) {
            Trainer trainer = Trainer.builder()
                    .user(saved)
                    .name(saved.getFullName() != null ? saved.getFullName() : saved.getUsername()) // ← lấy từ user
                    .status("Active")
                    .build();
            trainerRepository.save(trainer);
        }

        if (role.getRolename().name().equals("HORSE_OWNER")) {
            HorseOwner horseOwner = HorseOwner.builder()
                    .user(saved)
                    .name(request.getFullName())
                    .status("Active")
                    .build();
            horseOwnerRepository.save(horseOwner);
        }

        if (role.getRolename().name().equals("JOCKEY")) {
            Jockey jockey = Jockey.builder()
                    .user(saved)
                    .status("Active")
                    .build();
            jockeyRepository.save(jockey);
        }


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
    public AuthMeResponse updateProfile(UpdateProfileRequest request, Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhonenumber(request.getPhoneNumber());
        }
        if (request.getAvatar_url() != null) {
            user.setAvatarUrl(request.getAvatar_url());
        }

        User saved = userRepository.save(user);

        return buildCurrentUser(saved.getId());
    }


    @Override
    public AuthMeResponse getMe(CustomUserDetails userDetails) {
        return buildCurrentUser(userDetails.getId());
    }
    public void logout(String token) {
        // Lấy thời gian còn lại của token
        long expiration = jwtUtil.getExpirationTime(token); // milliseconds
        long ttl = expiration - System.currentTimeMillis();

        if (ttl > 0) {
            // Blacklist token cho đến khi nó hết hạn
            redisTemplate.opsForValue().set(
                    "blacklist:" + token,
                    "logout",
                    ttl,
                    TimeUnit.MILLISECONDS
            );
        }
    }
}