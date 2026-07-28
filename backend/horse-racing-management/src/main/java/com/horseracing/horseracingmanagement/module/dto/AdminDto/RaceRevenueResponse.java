package com.horseracing.horseracingmanagement.module.dto.AdminDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Doanh thu của MỘT cuộc đua, dùng cho bảng thống kê của admin.
 *
 * Không có bảng mới: mọi con số dưới đây là aggregate từ race_horse, bet_items
 * và race_result đã có sẵn.
 *
 * Lưu ý nghiệp vụ: betHandle (tổng tiền cược) KHÔNG phải doanh thu. Phần hệ thống
 * thực sự giữ lại là betHandle - betPayout. Cộng thẳng betHandle vào doanh thu sẽ
 * làm con số phồng lên rất phi lý khi đối soát.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RaceRevenueResponse {
    private Long raceId;
    private String raceName;
    private String status;
    private Instant startTime;

    private long totalHorses;          // số ngựa được duyệt tham gia
    private long totalBets;            // số phiếu cược

    // ----- Dòng tiền vào -----
    private BigDecimal entryFeeCollected;  // phí đăng ký thu từ chủ ngựa
    private BigDecimal betHandle;          // tổng tiền cược nhận vào

    // ----- Dòng tiền ra -----
    private BigDecimal betPayout;          // tiền trả cho phiếu thắng
    private BigDecimal prizePaid;          // tiền thưởng đã chia cho hạng 1/2/3

    // ----- Kết quả -----
    private BigDecimal betMargin;          // betHandle - betPayout (phần hệ thống giữ lại)
    private BigDecimal netRevenue;         // entryFee + betMargin - prizePaid
    private Double marginPercent;          // netRevenue / (entryFee + betHandle) * 100
}
