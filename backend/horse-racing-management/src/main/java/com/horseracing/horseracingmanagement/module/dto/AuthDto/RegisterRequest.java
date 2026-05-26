package com.horseracing.horseracingmanagement.module.dto.AuthDto;


import com.horseracing.horseracingmanagement.common.constant.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    private RoleName role;

    @NotBlank(message = "Full name is required")
    private String fullName;


    @NotBlank(message = "username is required")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10-11 digits")
    private String phone;
}
