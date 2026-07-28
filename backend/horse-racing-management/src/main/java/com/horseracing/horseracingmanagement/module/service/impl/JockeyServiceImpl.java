package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.common.exception.AppException;
import org.springframework.http.HttpStatus;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
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

    private Jockey getActiveJockey(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));
        if (!"Active".equalsIgnoreCase(jockey.getStatus())) {
            throw new AppException(
                    "Your Jockey role is no longer active. Please contact admin.",
                    HttpStatus.FORBIDDEN);
        }
        return jockey;
    }

    @Override
    public JockeyProfileResponse completeProfile(CompleteJockeyProfileRequest request, Long userId) {
        Jockey jockey = getActiveJockey(userId);

        if(request.getDateOfBirth()!=null)jockey.setDateOfBirth(request.getDateOfBirth());
        if (request.getExperienceYear() != null) jockey.setExperienceYear(request.getExperienceYear());
        if (request.getDescription() != null) jockey.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) jockey.setAvatarUrl(request.getAvatarUrl());          // ← thêm
        if (request.getCoverImageUrl() != null) jockey.setCoverImageUrl(request.getCoverImageUrl());

        return mapToProfileResponse(jockeyRepository.save(jockey));
    }

    @Override
    public JockeyProfileResponse getMyProfile(Long userId) {
        Jockey jockey = getActiveJockey(userId);
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

    // Danh sách công khai (card view) — chỉ Active, ẩn user bị banned, kèm thống kê race.
    @Override
    public List<JockeyResponse> getJockeyList() {
        return jockeyRepository.findByStatus("Active")
                .stream()
                .filter(j -> j.getUser() != null && j.getUser().getStatus() != UserStatus.BANNED)
                .map(j -> {
                    List<RaceHorse> raceHorses = getCollect(j);
                    long totalRaces = raceHorses.size();
                    long totalWins = raceHorses.stream()
                            .filter(rh -> {
                                Optional<RaceResult> result = raceResultRepository.findByRaceHorse_Id(rh.getId());
                                return result.isPresent() && result.get().getRank() == 1L;
                            })
                            .count();
                    double winRate = totalRaces > 0
                            ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

                    return JockeyResponse.builder()
                            .id(j.getId())
                            .name(j.getUser().getFullName() != null
                                    ? j.getUser().getFullName()
                                    : j.getUser().getUsername())
                            .dateOfBirth(j.getDateOfBirth())
                            .experienceYear(j.getExperienceYear())
                            .status(j.getStatus())
                            .avatarUrl(j.getAvatarUrl())
                            .coverImageUrl(j.getCoverImageUrl())
                            .description(j.getDescription())
                            .totalRaces(totalRaces)
                            .totalWins(totalWins)
                            .winRate(winRate)
                            .build();
                })
                .collect(Collectors.toList());
    }
    @Override
    public List<RaceParticipationResponse> getMyRaceHistory(Long userId) {
        Jockey jockey = getActiveJockey(userId);
        // Đọc từ race_result (snapshot) chứ không duyệt race_horse.jockey_id sống:
        // gỡ nài khỏi một lượt đăng ký sẽ không còn làm mất thành tích đã đua.
        return raceResultRepository.findByJockeyIdOrderByRaceDesc(jockey.getId())
                .stream()
                .map(this::buildParticipationFromResult)
                .collect(Collectors.toList());
    }
    // Trận sắp tới — UPCOMING, OPEN_REGISTRATION, CLOSED_REGISTRATION, OPEN_BETTING
    @Override
    public List<RaceParticipationResponse> getUpcomingRaces(Long userId) {
        Jockey jockey = getActiveJockey(userId);
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
        Jockey jockey = getActiveJockey(userId);
        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.ONGOING)
                .map(rh -> buildParticipationResponse(rh, jockey.getId()))
                .collect(Collectors.toList());
    }
    /**
     * Build response từ RaceResult — dùng cho LịCH SỬ (race đã xong).
     * Tên ngựa/nài lấy từ snapshot nên phản ánh đúng thời điểm đua.
     * buildParticipationResponse(RaceHorse) vẫn giữ nguyên cho race SẮP/ĐANG diễn ra,
     * vì lúc đó dữ liệu sống mới là đúng.
     */
    private RaceParticipationResponse buildParticipationFromResult(RaceResult rr) {
        RaceHorse rh = rr.getRaceHorse();

        String trainerName = null;
        Long trainerId = (rh != null && rh.getHorse() != null)
                ? rh.getHorse().getTrainerId() : null;
        if (trainerId != null) {
            trainerName = trainerRepository.findById(trainerId)
                    .map(t -> t.getUser().getFullName()).orElse(null);
        }

        return RaceParticipationResponse.builder()
                .raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName())
                .raceStatus(rr.getRace().getStatus() != null
                        ? rr.getRace().getStatus().name() : null)
                .location(rr.getRace().getLocation())
                .startTime(rr.getRace().getStartTime())
                .horseId(rr.getHorseId())
                .horseName(rr.getHorseName())
                .horseAvatarUrl(rh != null && rh.getHorse() != null
                        ? rh.getHorse().getAvatarUrl() : null)
                .jockeyId(rr.getJockeyId())
                .jockeyName(rr.getJockeyName())
                .trainerId(trainerId)
                .trainerName(trainerName)
                .rank(rr.getRank())
                .completionTimeSeconds(rr.getCompletionTimeSeconds())
                .completionTimeFormatted(formatTime(rr.getCompletionTimeSeconds()))
                .rewards(rr.getRewards())
                .registrationStatus(rh != null && rh.getStatus() != null
                        ? rh.getStatus().name() : null)
                .registerAt(rh != null ? rh.getRegisterAt() : null)
                .build();
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

        return raceResultRepository.findByJockeyIdOrderByRaceDesc(jockey.getId())
                .stream()
                .map(this::buildParticipationFromResult)
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
        long totalTop3 = 0L;        // ← thêm
        long totalRewards = 0L;     // ← thêm

        for (RaceHorse rh : finishedRaces) {
            Optional<RaceResult> result = raceResultRepository.findByRaceHorse_Id(rh.getId());
            if (result.isPresent()) {
                long rank = result.get().getRank() != null ? result.get().getRank() : 99L;
                if (rank == 1L) totalWins++;
                if (rank <= 3L) totalTop3++;    // ← tính top3

                // ← tính rewards theo % jockey
                if (result.get().getRewards() != null) {
                    BigDecimal jockeyPercent = rh.getJockeyRevenuePercent() != null
                            ? rh.getJockeyRevenuePercent()
                            : BigDecimal.valueOf(10);
                    totalRewards += BigDecimal.valueOf(result.get().getRewards())
                            .multiply(jockeyPercent)
                            .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                            .longValue();
                }
            }
        }

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 1000.0) / 10.0
                : 0.0;

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
                .dateOfBirth(jockey.getDateOfBirth())
                .experienceYear(jockey.getExperienceYear())
                .description(jockey.getDescription())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .totalTop3(totalTop3)       // ← thêm
                .winRate(winRate)
                .totalRewards(totalRewards) // ← thêm
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
                    return result.isPresent() && result.isPresent() && result.get().getRank() != null && result.get().getRank() == 1L;
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
                .dateOfBirth(jockey.getDateOfBirth())
                .experienceYear(jockey.getExperienceYear())
                .description(jockey.getDescription())
                .status(jockey.getStatus())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .winRate(winRate)
                .build();
    }

    private @NonNull List<RaceHorse> getCollect(Jockey jockey) {
        return raceHorseRepository.findByJockey_Id(jockey.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .filter(rh -> rh.getStatus() == RaceHorseStatus.FINISHED
                        || rh.getStatus() == RaceHorseStatus.DISQUALIFIED
                        || rh.getStatus() == RaceHorseStatus.APPROVED)
                .collect(Collectors.toList());
    }
}
