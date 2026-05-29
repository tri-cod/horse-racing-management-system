package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.util.JwtUtil;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.AuthMeResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginRequest;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.LoginResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.RegisterRequest;
import com.horseracing.horseracingmanagement.module.entity.Role;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.RoleRepository;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import jdk.jshell.spi.ExecutionControl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl  implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;


    @Value("${app.jwt.expiration:86400000}")
    private long jwtExpiration;


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
                .role(role).build();

        User saved = userRepository.save(user);
        return buildCurrentUser(saved.getId());
    }

    @Override
    public AuthMeResponse getMe(CustomUserDetails userDetails) {
        return buildCurrentUser(userDetails.getId());
    }
}
