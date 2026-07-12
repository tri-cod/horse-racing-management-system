package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.RaceResultResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceResult.SetRaceResultRequest;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceResultService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
    private final WebSocketNotificationService wsService;  // ← thêm
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

        // Lưu kết quả từng con ngựa + cộng tiền cho HorseOwner
        request.getResults().forEach(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            Long rewards = calculateRewards(race.getTotalprizepool(), item.getRank(),
                    request.getResults().size());

            raceResultRepository.save(RaceResult.builder()
                    .race(race)
                    .raceHorse(raceHorse)
                    .rank(item.getRank())
                    .completionTimeSeconds(item.getCompletionTimeSeconds())
                    .rewards(rewards)
                    .build());

            // ← Cộng tiền rewards vào wallet HorseOwner nếu có giải thưởng
            if (rewards > 0) {
                Long ownerId = raceHorse.getHorse().getOwnerId();

                HorseOwner horseOwner = horseOwnerRepository.findById(ownerId)
                        .orElseThrow(() -> new RuntimeException("HorseOwner not found"));

                Wallet ownerWallet = walletRepository.findByUser_Id(horseOwner.getUser().getId())
                        .orElseThrow(() -> new RuntimeException("Owner wallet not found"));

                ownerWallet.setBalance(ownerWallet.getBalance()
                        .add(BigDecimal.valueOf(rewards)));
                walletRepository.save(ownerWallet);

                // Gửi notification cho HorseOwner
                notificationService.sendToUser(
                        horseOwner.getUser().getId(),
                        "🏆 Your Horse Won Prize!",
                        String.format("Congratulations! Your horse '%s' finished #%d in race '%s' and earned %s!",
                                raceHorse.getHorse().getHorseName(),
                                item.getRank(),
                                race.getRaceName(),
                                rewards),
                        NotificationType.RACE_RESULT_PUBLISHED,
                        race.getId()
                );
            }
        });

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

    private Long calculateRewards(Long totalPrizePool, Long rank, int totalHorses) {
        if (totalPrizePool == null || totalPrizePool == 0) return 0L;
        return switch (rank.intValue()) {
            case 1 -> (long) (totalPrizePool * 0.50);
            case 2 -> (long) (totalPrizePool * 0.30);
            case 3 -> (long) (totalPrizePool * 0.20);
            default -> 0L;
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
                    long totalParticipants = raceResultRepository.countByRace_Id(rr.getRace().getId());
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
                    long totalParticipants = raceResultRepository.countByRace_Id(rr.getRace().getId());
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