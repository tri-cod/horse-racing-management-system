package com.horseracing.horseracingmanagement.common.constant;

public enum HorseStatus {
    ACTIVE,    // sẵn sàng, chưa trong race nào
    RACING,    // đang tham gia race (Approved + race chưa FINISHED)
    FINISHED,  // đã hoàn thành ít nhất 1 race (race FINISHED)
    INACTIVE,
    RETIRED
}
