package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
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
import java.util.Comparator;
import java.util.List;
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

    @Override
    @Transactional
    public void setRaceResult(SetRaceResultRequest request, Long userId) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Race must be ONGOING to set results");
        }

        // ← Validate không có 2 con cùng thời gian
        long distinctTimes = request.getResults().stream()
                .map(RaceResultItemRequest::getCompletionTimeSeconds)
                .distinct().count();
        if (distinctTimes != request.getResults().size()) {
            throw new RuntimeException(
                    "Two horses cannot have the same completion time. Please check again.");
        }

        // ← Sort theo giây tăng dần → tự tính rank (fix bug hạng 2 nhanh hơn hạng 1)
        List<RaceResultItemRequest> sorted = request.getResults().stream()
                .sorted(Comparator.comparingDouble(RaceResultItemRequest::getCompletionTimeSeconds))
                .collect(Collectors.toList());

        for (int i = 0; i < sorted.size(); i++) {
            RaceResultItemRequest item = sorted.get(i);
            long rank = i + 1;  // tự tính rank 1, 2, 3...

            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found with id: "
                            + item.getRaceHorseId()));

            Long rewards = calculateRewards(race.getTotalprizepool(), rank, sorted.size());

            raceResultRepository.save(RaceResult.builder()
                    .race(race)
                    .raceHorse(raceHorse)
                    .rank(rank)
                    .completionTimeSeconds(item.getCompletionTimeSeconds())
                    .rewards(rewards)
                    .build());

            // ← Chia tiền giải thưởng cho HorseOwner và Jockey theo %
            if (rewards > 0) {
                distributeRewards(raceHorse, race, rank, rewards);
            }
        }

        // Cập nhật race status → FINISHED
        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        // Push WebSocket
        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("FINISHED")
                .message("Race finished! Results published.")
                .updatedAt(Instant.now())
                .build());

        // Tính toán betting cho Spectator
        betService.calculateBetResults(request.getRaceId());

        // Notify admins
        notificationService.sendToAllAdmins(
                "🏁 Race Finished",
                String.format("Race '%s' finished. Results published!", race.getRaceName()),
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
        return raceResultRepository.findByHorseIdOrderByRaceDesc(horseId)
                .stream()
                .map(rr -> {
                    long totalParticipants = raceResultRepository
                            .countByRace_Id(rr.getRace().getId());
                    return mapToHistoryResponse(rr, totalParticipants);
                })
                .collect(Collectors.toList());
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
                .horseId(rr.getRaceHorse().getHorse().getId())
                .horseName(rr.getRaceHorse().getHorse().getHorseName())
                .breed(rr.getRaceHorse().getHorse().getBreed())
                .avatarUrl(rr.getRaceHorse().getHorse().getAvatarUrl())
                .jockeyId(rr.getRaceHorse().getJockey() != null
                        ? rr.getRaceHorse().getJockey().getId() : null)
                .jockeyName(rr.getRaceHorse().getJockey() != null
                        ? rr.getRaceHorse().getJockey().getUser().getFullName() : null)
                .raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName())
                .raceStartTime(rr.getRace().getStartTime())
                .rewards(rr.getRewards())
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
                .jockeyName(rr.getRaceHorse().getJockey() != null
                        ? rr.getRaceHorse().getJockey().getUser().getFullName() : null)
                .totalParticipants(totalParticipants)
                .build();
    }

    private String formatTime(Double seconds) {
        if (seconds == null) return null;
        int minutes = (int) (seconds / 60);
        double remainingSeconds = seconds % 60;
        return String.format("%d:%05.2f", minutes, remainingSeconds);
    }
}