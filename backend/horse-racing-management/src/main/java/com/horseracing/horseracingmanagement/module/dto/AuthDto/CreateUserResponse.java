package com.horseracing.horseracingmanagement.module.dto.AuthDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserResponse {
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
