package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.Bet.*;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.BetService;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BetServiceImpl implements BetService {

    private final UserRepository userRepository;
    private final BetRepository betRepository;
    private final BetItemRepository betItemRepository;
    private final RaceRepository raceRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;
    private final RaceResultRepository raceResultRepository;
    private final WebSocketNotificationService wsService;

    @Transactional
    public BetResponse placeBet(CreateBetRequest request, Long userId) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // Check race đang mở bet không
        if (race.getStatus() != RaceStatus.UPCOMING && race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Race is not open for betting");
        }

        // Tính tổng tiền bet
        long totalAmount = request.getBetItems().stream()
                .mapToLong(BetItemDto::getBetAmount).sum();

        // Check và trừ tiền wallet
        Wallet wallet = walletRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getBalance().compareTo(BigDecimal.valueOf(totalAmount)) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(BigDecimal.valueOf(totalAmount)));
        walletRepository.save(wallet);

        // Tạo Bet
        Bet bet = Bet.builder()
                .race(race)
                .user(userRepository.getReferenceById(userId))
                .totalAmount(BigDecimal.valueOf(totalAmount))
                .status("PENDING")
                .build();
        Bet savedBet = betRepository.save(bet);

        // Tạo BetItems
        List<BetItem> betItems = request.getBetItems().stream().map(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            // Odds mặc định = 2.0, sau này admin có thể set
            BigDecimal odds = BigDecimal.valueOf(2.0);

            return BetItem.builder()
                    .bet(savedBet)
                    .raceHorse(raceHorse)
                    .betAmount(item.getBetAmount())
                    .odds(odds)
                    .resultStatus("PENDING")
                    .build();
        }).collect(Collectors.toList());

        betItemRepository.saveAll(betItems);


        request.getBetItems().forEach(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow();

            BigDecimal totalBet = betItemRepository
                    .getTotalBetAmountByRaceHorse(item.getRaceHorseId());
            Long totalCount = betItemRepository
                    .getTotalBetCountByRaceHorse(item.getRaceHorseId());

            // Push cập nhật tổng bet cạnh con ngựa cho tất cả đang xem race
            wsService.sendBetUpdate(request.getRaceId(), BetUpdateMessage.builder()
                    .raceHorseId(item.getRaceHorseId())
                    .horseName(raceHorse.getHorse().getHorseName())
                    .totalBetAmount(totalBet)
                    .totalBetCount(totalCount)
                    .odds(BigDecimal.valueOf(2.0))
                    .build());
        });

        return mapToResponse(savedBet, betItems);

    }

    // System tự tính sau khi referee confirm kết quả
    @Transactional
    public void calculateBetResults(Long raceId) {
        // Lấy kết quả race — con ngựa về nhất
        RaceResult winner = raceResultRepository.findByRace_IdOrderByRankAsc(raceId)
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Race result not found"));

        Long winnerRaceHorseId = winner.getRaceHorse().getId();

        // Lấy tất cả bet PENDING của race này
        List<Bet> bets = betRepository.findByRaceIdAndStatus(raceId, "PENDING");

        bets.forEach(bet -> {
            List<BetItem> items = betItemRepository.findByBet_Id(bet.getId());
            boolean hasWon = false;
            BigDecimal totalPayout = BigDecimal.ZERO;

            for (BetItem item : items) {
                if (item.getRaceHorse().getId().equals(winnerRaceHorseId)) {
                    // Bet đúng → tính tiền thắng
                    BigDecimal payout = BigDecimal.valueOf(item.getBetAmount())
                            .multiply(item.getOdds());
                    item.setResultStatus("WON");
                    item.setPayout(payout);
                    totalPayout = totalPayout.add(payout);
                    hasWon = true;
                } else {
                    item.setResultStatus("LOST");
                    item.setPayout(BigDecimal.ZERO);
                }
                betItemRepository.save(item);
            }

            // Cập nhật status bet
            bet.setStatus(hasWon ? "WON" : "LOST");
            betRepository.save(bet);

            // Nếu thắng → cộng tiền vào wallet
            if (hasWon && totalPayout.compareTo(BigDecimal.ZERO) > 0) {
                Wallet wallet = walletRepository.findByUser_Id(bet.getUser().getId())
                        .orElseThrow();
                wallet.setBalance(wallet.getBalance().add(totalPayout));
                walletRepository.save(wallet);

                // Gửi notification
                notificationService.sendToUser(
                        bet.getUser().getId(),
                        "🏆 You Won!",
                        String.format("Congratulations! You won %s from race '%s'",
                                totalPayout, bet.getRace().getRaceName()),
                        NotificationType.RACE_RESULT_PUBLISHED,
                        raceId
                );
            } else {
                notificationService.sendToUser(
                        bet.getUser().getId(),
                        "Race Result",
                        String.format("Better luck next time! Your bet on race '%s' did not win.",
                                bet.getRace().getRaceName()),
                        NotificationType.RACE_RESULT_PUBLISHED,
                        raceId
                );
            }
        });
    }

    @Override
    public List<BetResponse> getMyBets(Long userId) {
        List<Bet> bets = betRepository.findByUserId(userId);
        return bets.stream()
                .map(bet -> {
                    List<BetItem> items = betItemRepository.findByBet_Id(bet.getId());
                    return mapToResponse(bet, items);
                })
                .collect(Collectors.toList());
    }

    private BetResponse mapToResponse(Bet bet, List<BetItem> betItems) {
        List<BetItemResponse> itemResponses = betItems.stream()
                .map(item -> BetItemResponse.builder()
                        .id(item.getId())
                        .raceHorseId(item.getRaceHorse().getId())
                        .horseName(item.getRaceHorse().getHorse().getHorseName())
                        .betAmount(item.getBetAmount())
                        .odds(item.getOdds())
                        .resultStatus(item.getResultStatus())
                        .payout(item.getPayout())
                        .build())
                .collect(Collectors.toList());

        return BetResponse.builder()
                .id(bet.getId())
                .raceId(bet.getRace().getId())
                .raceName(bet.getRace().getRaceName())
                .totalAmount(bet.getTotalAmount())
                .status(bet.getStatus())
                .betItems(itemResponses)
                .createdAt(bet.getCreatedAt())
                .build();
    }}