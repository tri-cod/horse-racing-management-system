package com.horseracing.horseracingmanagement.module.dto.AuthDto;


import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.validation.FieldsNotEqual;
import com.horseracing.horseracingmanagement.common.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@FieldsNotEqual(field1 = "username", field2 = "password",
        message = "Username and password cannot be the same")
public class RegisterRequest {
    private RoleName role;

    @NotBlank(message = "Full name is required")
    private String fullName;


    @NotBlank(message = "username is required")
    @Size(min = 3, max = 15, message = "Username must be between 3 and 15 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @ValidPassword
    private String password;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone number must be 10-11 digits")
    private String phone;
}
