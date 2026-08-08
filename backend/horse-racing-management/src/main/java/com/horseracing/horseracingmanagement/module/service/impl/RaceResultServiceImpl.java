package com.horseracing.horseracingmanagement.module.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCareerStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceResultResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceResultItemRequest;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceResultService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceResultServiceImpl implements RaceResultService {

    private final RaceResultRepository raceResultRepository;
    private final RaceRepository raceRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final BetServiceImpl betService;
    private final NotificationService notificationService;
    private final WebSocketNotificationService wsService;
    private final WalletRepository walletRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final HorseRepository horseRepository;  // ← thêm
    private final TrainerRepository trainerRepository;  // ← thêm (dùng trong distributeRewards)
    private final PenaltyRepository penaltyRepository;
    private final RaceRefereeRepository raceRefereeRepository;
    private final UserRepository userRepository;  // ← thêm (dùng để hoàn tiền giải dư về ví admin)

    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    @Transactional
    public void setRaceResult(SetRaceResultRequest request, Long userId) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Race must be ONGOING to set results");
        }

        // ← Check referee có phụ trách race này không
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));
        if (race.getReferee() == null || !race.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the referee of this race");
        }

        // ← Check đủ số ngựa APPROVED
        List<RaceHorse> approvedHorses = raceHorseRepository
                .findByRace_IdAndStatus(race.getId(), RaceHorseStatus.APPROVED);
        List<Long> approvedIds = approvedHorses.stream()
                .map(RaceHorse::getId).collect(Collectors.toList());

        List<Long> submittedIds = request.getResults().stream()
                .map(RaceResultItemRequest::getRaceHorseId).collect(Collectors.toList());

        // Check có horse nào trong kết quả không phải APPROVED không
        List<Long> invalidIds = submittedIds.stream()
                .filter(id -> !approvedIds.contains(id))
                .collect(Collectors.toList());
        if (!invalidIds.isEmpty()) {
            throw new RuntimeException("These raceHorseIds are not APPROVED: " + invalidIds);
        }

        // ← Cộng time penalty + handicap trước khi validate trùng thời gian
        List<RaceResultItemRequest> adjustedResults = request.getResults().stream()
                .map(item -> {
                    Double timePenalty = penaltyRepository
                            .findByRaceHorse_Id(item.getRaceHorseId())
                            .stream()
                            .filter(p -> p.getTimePenaltySeconds() != null)
                            .mapToDouble(Penalty::getTimePenaltySeconds)
                            .sum();


                    Double handicap = raceHorseRepository.findById(item.getRaceHorseId())
                            .map(RaceHorse::getHandicapSeconds)
                            .orElse(0.0);
                    if (handicap == null) handicap = 0.0;

                    return new RaceResultItemRequest(
                            item.getRaceHorseId(),
                            item.getCompletionTimeSeconds() + timePenalty + handicap
                    );
                })
                .collect(Collectors.toList());

        // ← Validate trùng thời gian SAU KHI cộng penalty
        long distinctTimes = adjustedResults.stream()
                .map(RaceResultItemRequest::getCompletionTimeSeconds)
                .distinct().count();
        if (distinctTimes != adjustedResults.size()) {
            throw new RuntimeException(
                    "Two horses have the same completion time (after penalty). Please check again.");
        }

        // ← Filter bỏ DISQUALIFIED + sort
        List<RaceResultItemRequest> sorted = adjustedResults.stream()
                .filter(item -> {
                    RaceHorse rh = raceHorseRepository.findById(item.getRaceHorseId()).orElse(null);
                    return rh != null && rh.getStatus() != RaceHorseStatus.DISQUALIFIED;
                })
                .sorted(Comparator.comparingDouble(RaceResultItemRequest::getCompletionTimeSeconds))
                .collect(Collectors.toList());

        if (sorted.isEmpty()) {
            throw new RuntimeException("No valid horses to set result for");
        }

        long totalDistributed = 0L;  // ← FIX: tích luỹ tổng đã chia để hoàn phần dư về admin

        for (int i = 0; i < sorted.size(); i++) {
            RaceResultItemRequest item = sorted.get(i);
            long rank = i + 1;

            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            Long rewards = calculateRewards(race.getTotalprizepool(), rank, sorted.size());
            totalDistributed += rewards;

            // Chốt danh tính ngay tại đây. Từ giây này trở đi, sửa tên hay xóa ngựa
            // đều không động được vào bản ghi lịch sử này nữa.
            Horse snapHorse = raceHorse.getHorse();
            Jockey snapJockey = raceHorse.getJockey();

            raceResultRepository.save(RaceResult.builder()
                    .race(race)
                    .raceHorse(raceHorse)
                    .rank(rank)
                    .completionTimeSeconds(item.getCompletionTimeSeconds())
                    .rewards(rewards)
                    .horseId(snapHorse != null ? snapHorse.getId() : null)
                    .horseName(snapHorse != null ? snapHorse.getHorseName() : null)
                    .jockeyId(snapJockey != null ? snapJockey.getId() : null)
                    .jockeyName(snapJockey != null && snapJockey.getUser() != null
                            ? snapJockey.getUser().getFullName()
                            : null)
                    .appliedHandicapSeconds(raceHorse.getHandicapSeconds())
                    .build());

            raceHorse.setStatus(RaceHorseStatus.FINISHED);
            raceHorseRepository.save(raceHorse);

            Horse horse = raceHorse.getHorse();
            horse.setStatus(HorseStatus.FINISHED);
            horseRepository.save(horse);

            if (rewards > 0) {
                distributeRewards(raceHorse, race, rank, rewards);
            }
        }

        // ← FIX: totalprizepool đã bị trừ TOÀN BỘ khỏi ví admin lúc tạo race (createRace),
        // nhưng chỉ hạng 1/2/3 mới nhận thưởng (50%/30%/20%). Nếu race có dưới 3 ngựa
        // về đích hợp lệ, phần % còn lại sẽ bị "kẹt" mãi mãi nếu không hoàn lại admin.
        if (race.getTotalprizepool() != null && race.getTotalprizepool() > 0) {
            long leftover = race.getTotalprizepool() - totalDistributed;
            if (leftover > 0) {
                userRepository.findFirstByRole_Rolename(RoleName.ADMIN).ifPresent(adminUser ->
                        walletRepository.findByUser_Id(adminUser.getId()).ifPresent(adminWallet -> {
                            adminWallet.setBalance(adminWallet.getBalance().add(BigDecimal.valueOf(leftover)));
                            walletRepository.save(adminWallet);
                        }));
            }
        }

        // ← Đổi status DISQUALIFIED horse sang FINISHED (không có rewards)
        raceHorseRepository.findByRace_IdAndStatus(race.getId(), RaceHorseStatus.DISQUALIFIED)
                .forEach(rh -> {
                    rh.setStatus(RaceHorseStatus.FINISHED);
                    raceHorseRepository.save(rh);
                    rh.getHorse().setStatus(HorseStatus.FINISHED);
                    horseRepository.save(rh.getHorse());
                });

        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("FINISHED")
                .message("Race finished! Results published.")
                .updatedAt(Instant.now())
                .build());

        betService.calculateBetResults(request.getRaceId());

        notificationService.sendToAllAdmins(
                "🏁 Race Finished",
                String.format("Race '%s' finished!", race.getRaceName()),
                NotificationType.RACE_RESULT_PUBLISHED,
                race.getId()
        );
    }

    // ← Chia tiền giải thưởng theo % thỏa thuận
    private void distributeRewards(RaceHorse raceHorse, Race race, long rank, Long rewards) {
        HorseOwner horseOwner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("HorseOwner not found"));

        Wallet ownerWallet = walletRepository.findByUser_Id(horseOwner.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Owner wallet not found"));

        BigDecimal totalReward = BigDecimal.valueOf(rewards);

        // Lấy % jockey đã thỏa thuận, mặc định 10% nếu chưa set
        BigDecimal jockeyPercent = raceHorse.getJockeyRevenuePercent() != null
                ? raceHorse.getJockeyRevenuePercent()
                : BigDecimal.valueOf(10);

        BigDecimal ownerPercent = BigDecimal.valueOf(100).subtract(jockeyPercent);

        BigDecimal jockeyReward = totalReward
                .multiply(jockeyPercent)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.FLOOR);
        BigDecimal ownerReward = totalReward.subtract(jockeyReward);

        // Cộng tiền cho Owner
        ownerWallet.setBalance(ownerWallet.getBalance().add(ownerReward));
        walletRepository.save(ownerWallet);

        notificationService.sendToUser(
                horseOwner.getUser().getId(),
                "🏆 Your Horse Won Prize!",
                String.format("Horse '%s' finished #%d in race '%s'! You received %s (%s%% of %s).",
                        raceHorse.getHorse().getHorseName(),
                        rank,
                        race.getRaceName(),
                        ownerReward,
                        ownerPercent,
                        totalReward),
                NotificationType.RACE_RESULT_PUBLISHED,
                race.getId()
        );

        // Cộng tiền cho Jockey nếu có
        if (raceHorse.getJockey() != null) {
            Wallet jockeyWallet = walletRepository
                    .findByUser_Id(raceHorse.getJockey().getUser().getId())
                    .orElse(null);

            if (jockeyWallet != null) {
                jockeyWallet.setBalance(jockeyWallet.getBalance().add(jockeyReward));
                walletRepository.save(jockeyWallet);

                notificationService.sendToUser(
                        raceHorse.getJockey().getUser().getId(),
                        "🏆 Prize Money Received!",
                        String.format("You received %s (%s%%) for riding '%s' to #%d in race '%s'!",
                                jockeyReward,
                                jockeyPercent,
                                raceHorse.getHorse().getHorseName(),
                                rank,
                                race.getRaceName()),
                        NotificationType.RACE_RESULT_PUBLISHED,
                        race.getId()
                );
            }
        }
    }

    // Tính rewards theo hạng
    private Long calculateRewards(Long totalPrizePool, long rank, int totalHorses) {
        if (totalPrizePool == null || totalPrizePool == 0) return 0L;
        return switch ((int) rank) {
            case 1 -> (long) (totalPrizePool * 0.50);  // hạng 1: 50%
            case 2 -> (long) (totalPrizePool * 0.30);  // hạng 2: 30%
            case 3 -> (long) (totalPrizePool * 0.20);  // hạng 3: 20%
            default -> 0L;                              // hạng 4+: không có
        };
    }

    @Override
    public List<RaceResultResponse> getRaceResults(Long raceId) {
        return raceResultRepository.findByRace_IdOrderByRankAsc(raceId)
                .stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceHistoryResponse> getHorseRaceHistory(Long horseId) {
        List<RaceResult> results = raceResultRepository.findByHorseIdOrderByRaceDesc(horseId);
        if (results.isEmpty()) return List.of();

        // Một query duy nhất cho toàn bộ danh sách thay vì countByRace_Id() trong vòng lặp (N+1).
        List<Long> raceIds = results.stream()
                .map(rr -> rr.getRace().getId())
                .distinct()
                .collect(Collectors.toList());
        Map<Long, Long> participantsByRace = raceResultRepository
                .countParticipantsByRaceIds(raceIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]));

        return results.stream()
                .map(rr -> mapToHistoryResponse(
                        rr,
                        participantsByRace.getOrDefault(rr.getRace().getId(), 0L)))
                .collect(Collectors.toList());
    }

    @Override
    public HorseCareerStatsResponse getHorseCareerStats(Long horseId) {
        long starts   = raceResultRepository.countStartsByHorseId(horseId);
        long wins     = raceResultRepository.countWinsByHorseId(horseId);
        long podiums  = raceResultRepository.countPodiumsByHorseId(horseId);
        Long earnings = raceResultRepository.sumRewardsByHorseId(horseId);
        Long bestRank = raceResultRepository.findBestRankByHorseId(horseId);

        double winRate = starts == 0 ? 0d
                : Math.round((wins * 10000d) / starts) / 100d;   // 2 chữ số thập phân
        double podiumRate = starts == 0 ? 0d
                : Math.round((podiums * 10000d) / starts) / 100d;

        return HorseCareerStatsResponse.builder()
                .horseId(horseId)
                .totalStarts(starts)
                .totalWins(wins)
                .totalPodiums(podiums)
                .totalEarnings(earnings == null ? 0L : earnings)
                .bestRank(bestRank)
                .winRate(winRate)
                .podiumRate(podiumRate)
                .build();
    }

    @Override
    public RaceHistoryResponse getHorseBestResult(Long horseId) {
        return raceResultRepository.findByHorseIdOrderByRaceDesc(horseId)
                .stream()
                .min(Comparator.comparing(RaceResult::getRank))
                .map(rr -> {
                    long totalParticipants = raceResultRepository
                            .countByRace_Id(rr.getRace().getId());
                    return mapToHistoryResponse(rr, totalParticipants);
                })
                .orElse(null);
    }

    private RaceResultResponse mapToResultResponse(RaceResult rr) {
        return RaceResultResponse.builder()
                .id(rr.getId())
                .rank(rr.getRank())
                .completionTimeSeconds(rr.getCompletionTimeSeconds())
                .completionTimeFormatted(formatTime(rr.getCompletionTimeSeconds()))
                .horseId(rr.getHorseId())
                .horseName(rr.getHorseName())
                .breed(rr.getRaceHorse().getHorse().getBreed())
                .avatarUrl(rr.getRaceHorse().getHorse().getAvatarUrl())
                .jockeyId(rr.getJockeyId())
                .jockeyName(rr.getJockeyName())
                .raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName())
                .raceStartTime(rr.getRace().getStartTime())
                .rewards(rr.getRewards())
                .appliedHandicapSeconds(rr.getAppliedHandicapSeconds())
                .build();
    }

    private RaceHistoryResponse mapToHistoryResponse(RaceResult rr, long totalParticipants) {
        return RaceHistoryResponse.builder()
                .raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName())
                .location(rr.getRace().getLocation())
                .startTime(rr.getRace().getStartTime())
                .rank(rr.getRank())
                .completionTimeSeconds(rr.getCompletionTimeSeconds())
                .completionTimeFormatted(formatTime(rr.getCompletionTimeSeconds()))
                .rewards(rr.getRewards())
                .horseName(rr.getHorseName())      // ← tên lúc đua, không phải tên hiện tại
                .jockeyName(rr.getJockeyName())
                .totalParticipants(totalParticipants)
                .appliedHandicapSeconds(rr.getAppliedHandicapSeconds())
                .build();
    }

    private String formatTime(Double seconds) {
        if (seconds == null) return null;
        int minutes = (int) (seconds / 60);
        double remainingSeconds = seconds % 60;
        return String.format("%d:%05.2f", minutes, remainingSeconds);
    }
}