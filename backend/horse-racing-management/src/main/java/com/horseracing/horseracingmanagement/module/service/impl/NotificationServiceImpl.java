package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.exception.ResourceNotFoundException;
import com.horseracing.horseracingmanagement.module.dto.NotificationResponse;
import com.horseracing.horseracingmanagement.module.entity.Notification;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.NotificationRepository;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.origin.SystemEnvironmentOrigin;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final WebSocketNotificationService wsNotificationService;

    @Override
    public void sendToUser(Long userId, String title, String content,
                           NotificationType type, Long referenceId) {// ← đổi String → NoiStatus
        System.out.println("Tuổi của bạn là: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type)  // ← truyền thẳng enum, không cần valueOf
                .referenceId(referenceId)
                .isRead(false)
                .build();
        notificationRepository.save(notification);

        wsNotificationService.sendToUser(user.getUsername(), mapToResponse(notification));
    }

    @Override
    public void sendToAllAdmins(String title, String content,
                                NotificationType type, Long referenceId) {  // ← đổi String → NoiStatus
        List<User> admins = userRepository.findByRole_Rolename(RoleName.ADMIN);
        admins.forEach(admin -> {
            Notification notification = notificationRepository.save(
                    Notification.builder()
                            .user(admin)
                            .title(title)
                            .content(content)
                            .type(type)  // ← truyền thẳng enum
                            .referenceId(referenceId)
                            .isRead(false)
                            .build()
            );
            wsNotificationService.sendToUser(admin.getUsername(), mapToResponse(notification));
        });
    }


    @Override
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new AppException("You don't have permission to delete this notification", HttpStatus.FORBIDDEN);
        }

        notificationRepository.delete(notification);
    }

    @Override
    public long countUnread(Long userId) {
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType().name())
                .referenceId(n.getReferenceId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}