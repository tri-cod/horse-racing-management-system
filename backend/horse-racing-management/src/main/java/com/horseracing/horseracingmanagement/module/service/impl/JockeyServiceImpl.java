package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.entity.Jockey;
import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import com.horseracing.horseracingmanagement.module.responsitory.JockeyRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceHorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.service.JockeyService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JockeyServiceImpl implements JockeyService {

    private final JockeyRepository jockeyRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceResultRepository raceResultRepository;
    private final TrainerRepository trainerRepository;
    @Override
    public JockeyProfileResponse completeProfile(CompleteJockeyProfileRequest request, Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        if (request.getAge() != null) jockey.setAge(request.getAge());
        if (request.getExperienceYear() != null) jockey.setExperienceYear(request.getExperienceYear());
        if (request.getDescription() != null) jockey.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) jockey.setAvatarUrl(request.getAvatarUrl());          // ← thêm
        if (request.getCoverImageUrl() != null) jockey.setCoverImageUrl(request.getCoverImageUrl());

        return mapToProfileResponse(jockeyRepository.save(jockey));
    }

    @Override
    public JockeyProfileResponse getMyProfile(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));
        return mapToProfileResponse(jockey);
    }

    @Override
    public JockeyProfileResponse getJockeyProfile(Long jockeyId) {
        Jockey jockey = jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));
        return mapToProfileResponse(jockey);
    }

    @Override
    public List<JockeyProfileResponse> getAllJockeys() {
        return jockeyRepository.findAll()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }
    @Override
    public List<RaceParticipationResponse> getMyRaceHistory(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));
        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(rh -> buildParticipationResponse(rh, jockey.getId()))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }
    // Trận sắp tới — UPCOMING, OPEN_REGISTRATION, CLOSED_REGISTRATION, OPEN_BETTING
    @Override
    public List<RaceParticipationResponse> getUpcomingRaces(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));
        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED)
                .map(rh -> buildParticipationResponse(rh, jockey.getId()))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }
    // Trận đang diễn ra — ONGOING
    @Override
    public List<RaceParticipationResponse> getCurrentRaces(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));
        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.ONGOING)
                .map(rh -> buildParticipationResponse(rh, jockey.getId()))
                .collect(Collectors.toList());
    }
    private RaceParticipationResponse buildParticipationResponse(RaceHorse rh, Long jockeyId) {
// Lấy kết quả nếu race đã FINISHED
        RaceResult result = raceResultRepository.findByRaceHorse_Id(rh.getId()).orElse(null);
// Lấy tên trainer của con ngựa
        String trainerName = null;
        Long trainerId = rh.getHorse().getTrainerId();
        if (trainerId != null) {
            trainerName = trainerRepository.findById(trainerId)
                    .map(t -> t.getUser().getFullName()).orElse(null);
        }

        return RaceParticipationResponse.builder()
                .raceId(rh.getRace().getId())
                .raceName(rh.getRace().getRaceName())
                .raceStatus(rh.getRace().getStatus().name())
                .location(rh.getRace().getLocation())
                .startTime(rh.getRace().getStartTime())
                .horseId(rh.getHorse().getId())
                .horseName(rh.getHorse().getHorseName())
                .horseAvatarUrl(rh.getHorse().getAvatarUrl())
                .jockeyId(rh.getJockey() != null ? rh.getJockey().getId() : null)
                .jockeyName(rh.getJockey() != null
                        ? rh.getJockey().getUser().getFullName() : null)
                .trainerId(trainerId)
                .trainerName(trainerName)
                .rank(result != null ? result.getRank() : null)
                .completionTimeSeconds(result != null ? result.getCompletionTimeSeconds() : null)
                .completionTimeFormatted(result != null
                        ? formatTime(result.getCompletionTimeSeconds()) : null)
                .rewards(result != null ? result.getRewards() : null)
                .registrationStatus(rh.getStatus().name())
                .registerAt(rh.getRegisterAt())
                .build();
    }
    private String formatTime(Double seconds) {
        if (seconds == null) return null;
        int minutes = (int) (seconds / 60);
        double remaining = seconds % 60;
        return String.format("%d:%05.2f", minutes, remaining);
    }

    // Public — lấy theo jockeyId (không cần userId)
    @Override
    public List<RaceParticipationResponse> getRaceHistoryById(Long jockeyId) {
        Jockey jockey = jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(rh -> buildParticipationResponse(rh, jockeyId))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceParticipationResponse> getUpcomingRacesById(Long jockeyId) {
        Jockey jockey = jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED)
                .map(rh -> buildParticipationResponse(rh, jockeyId))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }

    @Override
    public JockeyStatsResponse getStats(Long jockeyId) {
        Jockey jockey = jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        List<RaceHorse> allRaceHorses = raceHorseRepository.findByJockey_Id(jockeyId);
        List<RaceHorse> finishedRaces = allRaceHorses.stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .collect(Collectors.toList());

        long totalRaces = finishedRaces.size();
        long totalWins = 0L;
        long totalTop3 = 0L;
        long totalRewards = 0L;

        for (RaceHorse rh : finishedRaces) {
            RaceResult result = raceResultRepository.findByRaceHorse_Id(rh.getId()).orElse(null);
            if (result != null) {
                if (result.getRank() == 1L) totalWins++;
                if (result.getRank() <= 3L) totalTop3++;
                if (result.getRewards() != null) {
                    // Jockey nhận % từ rewards
                    BigDecimal jockeyPercent = rh.getJockeyRevenuePercent() != null
                            ? rh.getJockeyRevenuePercent()
                            : BigDecimal.valueOf(10);
                    totalRewards += BigDecimal.valueOf(result.getRewards())
                            .multiply(jockeyPercent)
                            .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                            .longValue();
                }
            }
        }

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

        // 5 trận gần nhất
        List<RaceParticipationResponse> recentHistory = finishedRaces.stream()
                .map(rh -> buildParticipationResponse(rh, jockeyId))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .limit(5)
                .collect(Collectors.toList());

        return JockeyStatsResponse.builder()
                .jockeyId(jockeyId)
                .name(jockey.getUser().getFullName() != null
                        ? jockey.getUser().getFullName()
                        : jockey.getUser().getUsername())
                .avatarUrl(jockey.getAvatarUrl())
                .coverImageUrl(jockey.getCoverImageUrl())
                .age(jockey.getAge())
                .experienceYear(jockey.getExperienceYear())
                .description(jockey.getDescription())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .totalTop3(totalTop3)
                .winRate(winRate)
                .totalRewards(totalRewards)
                .recentHistory(recentHistory)
                .build();
    }


    private JockeyProfileResponse mapToProfileResponse(Jockey jockey) {
        // Tính thống kê race
        List<RaceHorse> raceHorses = getCollect(jockey);
        long totalRaces = raceHorses.size();
        long totalWins = raceHorses.stream()
                .filter(rh -> {
                    Optional<RaceResult> result = raceResultRepository
                            .findByRaceHorse_Id(rh.getId());
                    return result.isPresent() && result.get().getRank() == 1L;
                })
                .count();

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .userId(jockey.getUser().getId())
                .name(jockey.getUser().getFullName() != null
                        ? jockey.getUser().getFullName()
                        : jockey.getUser().getUsername())
                .avatarUrl(jockey.getAvatarUrl())        // ← thêm
                .coverImageUrl(jockey.getCoverImageUrl())
                .age(jockey.getAge())
                .experienceYear(jockey.getExperienceYear())
                .description(jockey.getDescription())
                .status(jockey.getStatus())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .winRate(winRate)
                .build();
    }

    private @NonNull List<RaceHorse> getCollect(Jockey jockey) {
        return raceHorseRepository
                .findByJockey_IdAndStatus(jockey.getId(), RaceHorseStatus.APPROVED)
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .collect(Collectors.toList());
    }
}
