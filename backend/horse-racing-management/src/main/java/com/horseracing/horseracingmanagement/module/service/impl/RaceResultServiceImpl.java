package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import com.horseracing.horseracingmanagement.module.responsitory.RaceHorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceResultService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RaceResultServiceImpl implements RaceResultService {

    private final RaceResultRepository raceResultRepository;
    private final RaceRepository raceRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final BetServiceImpl betService;
    private final NotificationService notificationService;

    // Referee set kết quả
    @Transactional
    public void setRaceResult(SetRaceResultRequest request, Long userId) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // Lưu từng kết quả
        request.getResults().forEach(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            RaceResult result = RaceResult.builder()
                    .race(race)
                    .raceHorse(raceHorse)
                    .rank(item.getRank())
                    .build();

            raceResultRepository.save(result);
        });

        // Cập nhật race status
        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        // ← System tự tính toán betting sau khi có kết quả
        betService.calculateBetResults(request.getRaceId());

        // Gửi notification cho tất cả
        notificationService.sendToAllAdmins(
                "🏁 Race Finished",
                String.format("Race '%s' has finished. Results published!", race.getRaceName()),
                NotificationType.RACE_RESULT_PUBLISHED,
                race.getId()
        );
    }
}