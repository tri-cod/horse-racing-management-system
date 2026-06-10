package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
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

    @Scheduled(fixedRate = 60000)
    public void autoCloseRace() {

        LocalDateTime now = LocalDateTime.now();

        List<Race> races =
                raceRepository.findByStatus(RaceStatus.OPEN_REGISTRATION);
        for (Race race : races) {if (Instant.now().isAfter(
                race.getStartTime()
                        .minus(1, ChronoUnit.DAYS)
        )) {

            race.setStatus(
                    RaceStatus.CLOSED_REGISTRATION
            );
        }                raceRepository.save(race);
            }
        }
    }
