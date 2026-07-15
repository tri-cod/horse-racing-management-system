package com.horseracing.horseracingmanagement.common.constant;

public enum NotificationType {

    // Race Horse
    RACE_REGISTRATION,      // HorseOwner đăng ký horse vào race → gửi Admin
    RACE_APPROVED,          // Admin duyệt horse → gửi HorseOwner
    RACE_REJECTED,     // Admin từ chối horse → gửi HorseOwner
    RACE_WITHDRAWAL,

    // Race
    RACE_CREATED,           // Admin tạo race mới → gửi tất cả
    RACE_UPDATED,           // Admin cập nhật race → gửi người liên quan
    RACE_CANCELLED,         // Admin hủy race → gửi tất cả
    RACE_STARTED,           // Race bắt đầu → gửi tất cả
    RACE_FINISHED,          // Race kết thúc → gửi tất cả

    // Race Result
    RACE_RESULT_PUBLISHED,  // Referee công bố kết quả → gửi tất cả

    // System
    SYSTEM                  // Thông báo hệ thống chung
}