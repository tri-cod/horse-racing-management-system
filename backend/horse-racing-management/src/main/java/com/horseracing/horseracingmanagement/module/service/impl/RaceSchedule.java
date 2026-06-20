package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRefereeRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RaceSchedule {

    private final RaceRepository raceRepository;
    private final NotificationService notificationService;
    private final RaceRefereeRepository raceRefereeRepository;
    private final WebSocketNotificationService wsService; // [WS] inject để push auto-close

    // Chạy mỗi phút
    @Scheduled(fixedRate = 60000)
    public void autoCloseRegistration() {
        Instant now = Instant.now();
        Instant oneDayFromNow = now.plus(1, ChronoUnit.DAYS);

        List<Race> races = raceRepository.findByStatus(RaceStatus.OPEN_REGISTRATION);
        for (Race race : races) {
            if (race.getStartTime() != null && now.isAfter(
                    race.getStartTime().minus(1, ChronoUnit.DAYS))) {

                race.setStatus(RaceStatus.CLOSED_REGISTRATION);
                raceRepository.save(race);

                // [WS] Notify FE về auto-close — user đang xem list/detail thấy nút Bet xuất hiện ngay
                wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                        .raceId(race.getId())
                        .raceName(race.getRaceName())
                        .status("CLOSED_REGISTRATION")
                        .message("Registration automatically closed. Betting is now open!")
                        .updatedAt(Instant.now())
                        .build());

                if (race.getReferee() != null && race.getReferee().getUser() != null) {
                    notificationService.sendToUser(
                            race.getReferee().getUser().getId(),
                            "⚠️ Race Tomorrow!",
                            String.format("Race '%s' is scheduled for tomorrow. Please be ready.",
                                    race.getRaceName()),
                            NotificationType.RACE_CREATED,
                            race.getId()
                    );
                }
            }
        }
    }

    // Ngày đua — gửi thông báo cho referee vào buổi sáng
    @Scheduled(cron = "0 0 7 * * *")  // 7h sáng mỗi ngày
    public void notifyRefereeOnRaceDay() {
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);

        List<Race> todayRaces = raceRepository.findByStatus(RaceStatus.CLOSED_REGISTRATION);
        todayRaces.stream()
                .filter(race -> race.getStartTime() != null
                        && race.getStartTime().isAfter(startOfDay)
                        && race.getStartTime().isBefore(endOfDay))
                .forEach(race -> {
                    if (race.getReferee() != null && race.getReferee().getUser() != null) {
                        notificationService.sendToUser(
                                race.getReferee().getUser().getId(),
                                "🏇 Race Day!",
                                String.format("Race '%s' starts today at %s. Please start the race when ready.",
                                        race.getRaceName(), race.getStartTime()),
                                NotificationType.RACE_STARTED,
                                race.getId()
                        );
                    }
                });
    }
}