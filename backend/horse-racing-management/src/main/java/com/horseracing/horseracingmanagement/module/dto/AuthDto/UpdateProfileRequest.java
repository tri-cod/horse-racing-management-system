package com.horseracing.horseracingmanagement.module.dto.AuthDto;

import com.horseracing.horseracingmanagement.common.validation.NoSpecialCharacters;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Full name must not contain special characters")
    private String fullName;

    private String phoneNumber;
    public String avatar_url;
}