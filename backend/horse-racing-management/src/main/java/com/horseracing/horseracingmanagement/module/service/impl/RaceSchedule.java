package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRefereeRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RaceSchedule {

    private final RaceRepository raceRepository;
    private final NotificationService notificationService;
    private final RaceRefereeRepository raceRefereeRepository;
    private final WebSocketNotificationService wsService; // [WS] inject để push auto-close
    private final RaceService raceService;

    @Scheduled(fixedRate = 60000)
    public void autoOpenRegistration() {
        Instant now = Instant.now();

        List<Race> races = raceRepository.findByStatus(RaceStatus.UPCOMING);
        for (Race race : races) {
            if (race.getRegistrationOpenDate() != null
                    && !race.getRegistrationOpenDate().isAfter(now)) {

                race.setStatus(RaceStatus.OPEN_REGISTRATION);
                raceRepository.save(race);

                wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                        .raceId(race.getId())
                        .raceName(race.getRaceName())
                        .status("OPEN_REGISTRATION")
                        .message("Registration is now open!")
                        .updatedAt(Instant.now())
                        .build());
            }
        }
    }

    // Chạy mỗi phút. Reuses RaceServiceImpl.closeRace() (same as the admin's manual
    // "Close Reg" button) instead of setting the status field directly — that method
    // already carries the race all the way to SETTING_ODDS and refunds/cleans up any
    // still-pending jockey requests via cleanupPendingOnClose(). Setting the enum
    // directly here used to skip both of those and strand the race in
    // CLOSED_REGISTRATION with no way for the UI to reach SETTING_ODDS.
    @Scheduled(fixedRate = 60000)
    public void autoCloseRegistration() {
        Instant now = Instant.now();

        List<Race> races = raceRepository.findByStatus(RaceStatus.OPEN_REGISTRATION);
        for (Race race : races) {
            if (race.getStartTime() != null && now.isAfter(
                    race.getStartTime().minus(2, ChronoUnit.DAYS))) {

                try {
                    raceService.closeRace(race.getId());
                } catch (Exception ex) {
                    log.error("Auto-close registration failed for race {}: {}", race.getId(), ex.getMessage());
                    continue;
                }

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



    // Ngày đua — gửi thông báo cho referee vào buổi sáng.
    // Races no longer linger in CLOSED_REGISTRATION (closeRace() carries them straight
    // through to SETTING_ODDS) — SETTING_ODDS/OPEN_BETTING is the equivalent "final
    // pre-race" bucket now, so the referee still gets pinged even if odds are late.
    @Scheduled(cron = "0 0 7 * * *")  // 7h sáng mỗi ngày
    public void notifyRefereeOnRaceDay() {
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);

        List<Race> todayRaces = raceRepository.findByStatusIn(
                List.of(RaceStatus.SETTING_ODDS, RaceStatus.OPEN_BETTING));
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

    // Reuses RaceServiceImpl.openBetting() (same as the admin's manual "Open Betting"
    // button), which validates every APPROVED horse already has odds set before
    // flipping the race live. If odds are still missing, it throws instead of opening
    // betting — this job just logs that and nudges the admin instead of forcing the
    // race open with unpriced horses.
    @Scheduled(fixedRate = 60000)
    public void autoOpenBetting() {
        Instant now = Instant.now();

        List<Race> races = raceRepository.findByStatus(RaceStatus.SETTING_ODDS);
        for (Race race : races) {
            if (race.getStartTime() != null && now.isAfter(
                    race.getStartTime().minus(1, ChronoUnit.DAYS))) {

                try {
                    raceService.openBetting(race.getId());
                } catch (Exception ex) {
                    log.warn("Auto-open betting skipped for race {} — {}", race.getId(), ex.getMessage());
                    notificationService.sendToAllAdmins(
                            "⚠️ Odds Still Missing",
                            String.format("Race '%s' starts within a day but betting couldn't open automatically: %s",
                                    race.getRaceName(), ex.getMessage()),
                            NotificationType.SYSTEM,
                            race.getId()
                    );
                }
            }
        }
    }
}