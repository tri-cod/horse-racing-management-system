package com.horseracing.horseracingmanagement.module.dto.BankAccountDto;


import com.horseracing.horseracingmanagement.common.validation.NoSpecialCharacters;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBankAccountRequest {
    @NotBlank
    @Size(min = 2, max = 150, message = "Bank name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Bank name must not contain special characters")
    private String bankName;

    @NotBlank
    @Size(min = 2, max = 150, message = "Bank account owner name must be between 2 and 150 characters")
    @NoSpecialCharacters(message = "Bank account owner name must not contain special characters")
    private String bankUserName;

    @NotBlank
    private String bankNumber;
}