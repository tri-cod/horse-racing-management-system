package com.horseracing.horseracingmanagement.common.constant;

public enum RaceClass {
    // MAIDEN: dành riêng cho ngựa CHƯA từng thắng trận nào
    MAIDEN   (0L,              0L),
    CLASS_4  (0L,              50_000_000L),
    CLASS_3  (0L,             150_000_000L),
    CLASS_2  (0L,             400_000_000L),
    CLASS_1  (0L,           1_000_000_000L),
    LISTED   (200_000_000L,           null),   // null = không giới hạn trần
    GRADE_1  (500_000_000L,           null);

    private final Long defaultMinEarnings;
    private final Long defaultMaxEarnings;

    RaceClass(Long defaultMinEarnings, Long defaultMaxEarnings) {
        this.defaultMinEarnings = defaultMinEarnings;
        this.defaultMaxEarnings = defaultMaxEarnings;
    }

    public Long getDefaultMinEarnings() { return defaultMinEarnings; }
    public Long getDefaultMaxEarnings() { return defaultMaxEarnings; }
}