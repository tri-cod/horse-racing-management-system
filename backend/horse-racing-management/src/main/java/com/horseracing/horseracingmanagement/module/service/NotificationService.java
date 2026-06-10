package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.module.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    void sendToUser(Long userId, String title, String content, NotificationType type, Long referenceId);
    void sendToAllAdmins(String title, String content, NotificationType type, Long referenceId);
    List<NotificationResponse> getMyNotifications(Long userId);
    void markAsRead(Long notificationId);
    long countUnread(Long userId);
}