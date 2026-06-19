package com.horseracing.horseracingmanagement.module.dto.BankAccountDto;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBankAccountRequest {
    @NotBlank
    private String bankName;
    @NotBlank
    private String bankUserName;
    @NotBlank
    private String bankNumber;
}