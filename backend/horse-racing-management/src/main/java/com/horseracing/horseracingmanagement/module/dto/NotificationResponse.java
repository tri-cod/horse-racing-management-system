package com.horseracing.horseracingmanagement.module.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String content;
    private String type;
    private Long referenceId;
    private Boolean isRead;
    private Instant createdAt;
}