package com.horseracing.horseracingmanagement.module.dto.AuthDto;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AuthMeResponse {
    private Long id;
    private String username;
    private String role;
    private String email;
    private String fullName;
    private Boolean verified;
    private String phoneNumber;
    private String avatar;
    private String status;
    private BigDecimal balance;
}
