package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.dto.Bet.BetUpdateMessage;
import com.horseracing.horseracingmanagement.module.dto.NotificationResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;


    // Gửi cho 1 user cụ thể
    public void sendToUser(String username, NotificationResponse notification) {
        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications",
                notification
        );
    }


    // ← thêm: gửi race status update cho tất cả
    public void sendRaceStatusUpdate(RaceStatusUpdate update) {
        messagingTemplate.convertAndSend("/topic/race-status", update);
    }

    // ← thêm: gửi bet update realtime cạnh con ngựa
    public void sendBetUpdate(Long raceId, BetUpdateMessage update) {
        messagingTemplate.convertAndSend("/topic/race/" + raceId + "/bets", update);
    }


    // Gửi cho tất cả (broadcast)
    public void sendToAll(NotificationResponse notification) {
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
}