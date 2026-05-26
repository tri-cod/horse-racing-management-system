package com.horseracing.horseracingmanagement.module.dto.AuthDto;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthMeResponse {
    private Long id;
    private String username;
    private String password;
    private String role;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private String status;
}
