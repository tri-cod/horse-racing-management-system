package com.horseracing.horseracingmanagement.module.dto.BankAccountDto;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawRequest {
    @NotNull
    private Long amount;
    @NotNull
    private Long bankAccountId;  // ← user chọn tài khoản ngân hàng đã lưu để nhận tiền
}
