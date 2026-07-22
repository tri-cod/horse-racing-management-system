package com.horseracing.horseracingmanagement.common.constant;

public enum DistanceCategory {
    SPRINT(0, 1400),        // cự ly ngắn
    MILE(1401, 1800),       // cự ly trung bình
    MIDDLE(1801, 2400),     // cự ly trung dài
    LONG(2401, 99999);      // cự ly dài

    private final int minMeters;
    private final int maxMeters;

    DistanceCategory(int minMeters, int maxMeters) {
        this.minMeters = minMeters;
        this.maxMeters = maxMeters;
    }

    public int getMinMeters() { return minMeters; }
    public int getMaxMeters() { return maxMeters; }

    /** Suy ra nhóm cự ly từ số mét của race (nhận số thực để hỗ trợ cự ly có phần lẻ) */
    public static DistanceCategory fromMeters(Double meters) {
        if (meters == null) return null;
        for (DistanceCategory c : values()) {
            if (meters >= c.minMeters && meters <= c.maxMeters) return c;
        }
        return LONG;
    }
}