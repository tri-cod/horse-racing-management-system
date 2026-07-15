package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.WithdrawalRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyRequestDto;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetAllOddsRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.SetOddsRequest;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceHorseServiceImpl implements RaceHorseService {

    private final UserRepository userRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final JockeyRepository jockeyRepository;
    private final BetItemRepository betItemRepository;
    private final WalletRepository walletRepository;

    private final NotificationService notificationService;
    @Override
    public RaceHorseResponse registerHorseToRace(RegisterRaceHorseRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.UPCOMING &&
                race.getStatus() != RaceStatus.OPEN_REGISTRATION) {
            throw new RuntimeException("Race is not open for registration");
        }

        if (race.getRegistrationDeadline() != null &&
                Instant.now().isAfter(race.getRegistrationDeadline())) {
            throw new RuntimeException("Registration deadline has passed");
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        if (horse.getTrainerId() == null) {
            throw new RuntimeException("Horse must have a trainer before registering");
        }

        if (raceHorseRepository.existsByRace_IdAndHorse_Id(race.getId(), horse.getId())) {
            throw new RuntimeException("Horse already registered in this race");
        }

        // Check cùng ngày
        if (race.getStartTime() != null) {
            List<Long> horsesOnSameDay = raceHorseRepository.findHorseIdsOnSameDay(
                    race.getId(), race.getStartTime());
            if (horsesOnSameDay.contains(request.getHorseId())) {
                throw new RuntimeException(
                        "This horse is already registered in another race on the same day");
            }
        }

        // ← Trừ phí tham gia khỏi ví HorseOwner
        if (race.getEntryFee() != null && race.getEntryFee() > 0) {
            Wallet ownerWallet = walletRepository.findByUser_Id(owner.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));

            if (ownerWallet.getBalance().compareTo(
                    BigDecimal.valueOf(race.getEntryFee())) < 0) {
                throw new RuntimeException("Insufficient balance to pay entry fee");
            }

            ownerWallet.setBalance(ownerWallet.getBalance()
                    .subtract(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(ownerWallet);
        }

        // ← Tạo RaceHorse với status "PendingJockey" — chưa gắn jockey
        RaceHorse saved = raceHorseRepository.save(RaceHorse.builder()
                .race(race)
                .horse(horse)
                .jockey(null)  // ← chưa có jockey
                .status("PendingJockey")
                .build());

        // Notify admin
        notificationService.sendToAllAdmins(
                "New Race Registration",
                String.format("Horse '%s' registered to race '%s'. Waiting for jockey.",
                        horse.getHorseName(), race.getRaceName()),
                NotificationType.RACE_REGISTRATION,
                saved.getId()  // ← save trước rồi mới lấy id
        );

        return mapToResponse(saved);
    }

    // ============ STEP 2 — HorseOwner gửi request cho Jockey ============
    @Override
    public RaceHorseResponse sendJockeyRequest(JockeyRequestDto request, Long userId) {
        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        // Check owner đúng không
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        if (!raceHorse.getHorse().getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        if (!raceHorse.getStatus().equals("PendingJockey") &&
                !raceHorse.getStatus().equals("JockeyRejected")) {
            throw new RuntimeException("Cannot send jockey request at this stage");
        }

        Jockey jockey = jockeyRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        // Check jockey đã trong race này chưa
        if (raceHorseRepository.existsByRace_IdAndJockey_Id(
                raceHorse.getRace().getId(), jockey.getId())) {
            throw new RuntimeException("Jockey already assigned in this race");
        }

        raceHorse.setJockey(jockey);
        raceHorse.setStatus("PendingJockey");
        raceHorseRepository.save(raceHorse);

        // Notify Jockey
        notificationService.sendToUser(
                jockey.getUser().getId(),
                "🏇 Jockey Request!",
                String.format("You have been invited to ride horse '%s' in race '%s'. Please accept or decline.",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_REGISTRATION,
                raceHorse.getId()
        );

        return mapToResponse(raceHorse);
    }

    // ============ STEP 3A — Jockey chấp nhận ============
    @Override
    public RaceHorseResponse jockeyAccept(Long raceHorseId, Long userId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        // Check đúng jockey không
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        if (!raceHorse.getJockey().getId().equals(jockey.getId())) {
            throw new RuntimeException("You are not the assigned jockey");
        }

        if (!raceHorse.getStatus().equals("PendingJockey")) {
            throw new RuntimeException("No pending jockey request");
        }

        // ← Jockey chấp nhận → chuyển sang chờ Admin duyệt
        raceHorse.setStatus("PendingAdmin");
        raceHorseRepository.save(raceHorse);

        // Notify Admin
        notificationService.sendToAllAdmins(
                "Horse Ready for Approval",
                String.format("Jockey accepted. Horse '%s' is waiting for admin approval in race '%s'.",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_REGISTRATION,
                raceHorseId
        );

        // Notify HorseOwner
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow();
        notificationService.sendToUser(
                owner.getUser().getId(),
                "✅ Jockey Accepted!",
                String.format("Jockey accepted your request for horse '%s'. Waiting for admin approval.",
                        raceHorse.getHorse().getHorseName()),
                NotificationType.RACE_APPROVED,
                raceHorseId
        );

        return mapToResponse(raceHorse);
    }

    @Override
    public RaceHorseResponse jockeyDecline(Long raceHorseId, Long userId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        if (!raceHorse.getJockey().getId().equals(jockey.getId())) {
            throw new RuntimeException("You are not the assigned jockey");
        }

        // ← Jockey từ chối → HorseOwner chọn jockey khác
        raceHorse.setStatus("JockeyRejected");
        raceHorse.setJockey(null);  // ← xóa jockey, cho chọn lại
        raceHorseRepository.save(raceHorse);

        // Notify HorseOwner
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow();
        notificationService.sendToUser(
                owner.getUser().getId(),
                "❌ Jockey Declined",
                String.format("Jockey declined your request for horse '%s'. Please choose another jockey.",
                        raceHorse.getHorse().getHorseName()),
                NotificationType.RACE_REJECTED,
                raceHorseId
        );

        return mapToResponse(raceHorse);
    }


    @Override
    public List<RaceHorseResponse> getJockeyRequests(Long userId) {
        // Tìm Jockey từ userId
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        // Lấy các RaceHorse đang chờ jockey này xác nhận
        return raceHorseRepository.findByJockey_IdAndStatus(jockey.getId(), "PendingJockey")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceHorseResponse> getRaceHorseList(Long raceId) {
        return raceHorseRepository.findByRace_Id(raceId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceHorseResponse> getMyHorseRaces(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        return raceHorseRepository.findByHorse_OwnerId(owner.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RaceHorseResponse approveHorse(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals("PendingAdmin")) {
            throw new RuntimeException("Horse must be PendingAdmin to approve");
        }

        raceHorse.setStatus("Approved");
        RaceHorse saved = raceHorseRepository.save(raceHorse);  // ← save trước

        HorseOwner ho = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        notificationService.sendToUser(
                ho.getUser().getId(),
                "🎉 Registration Approved!",
                String.format("Your horse '%s' has been approved for race '%s'!",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_APPROVED,
                raceHorseId
        );

        return mapToResponse(saved);
    }

    @Override
    public RaceHorseResponse rejectHorse(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        HorseOwner ho = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // ← Hoàn phí tham gia nếu có
        Race race = raceHorse.getRace();
        if (race.getEntryFee() != null && race.getEntryFee() > 0) {
            Wallet ownerWallet = walletRepository.findByUser_Id(ho.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));
            ownerWallet.setBalance(ownerWallet.getBalance()
                    .add(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(ownerWallet);
        }
        raceHorse.setStatus("Rejected");
        RaceHorse saved = raceHorseRepository.save(raceHorse);
        // Notify HorseOwner
        notificationService.sendToUser(
                ho.getUser().getId(),
                "❌ Registration Rejected",
                String.format("Your horse '%s' has been rejected from race '%s'. Entry fee refunded.",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_REJECTED,
                raceHorseId
        );



        // ← xóa hẳn khỏi race (fix bug: trước đây save sau delete tạo lại record)
        raceHorseRepository.deleteById(raceHorseId);  // xóa sau khi đã notify
        return mapToResponse(saved);  // trả về thông tin trước khi xóa
    }


    public void cleanupPendingOnClose(Long raceId) {
        List<RaceHorse> pendingList = raceHorseRepository
                .findByRace_IdAndStatusIn(raceId,
                        List.of("PendingJockey", "JockeyRejected"));

        pendingList.forEach(raceHorse -> {
            // Hoàn phí nếu có
            Race race = raceHorse.getRace();
            if (race.getEntryFee() != null && race.getEntryFee() > 0) {
                HorseOwner owner = horseOwnerRepository
                        .findById(raceHorse.getHorse().getOwnerId()).orElse(null);
                if (owner != null) {
                    Wallet wallet = walletRepository
                            .findByUser_Id(owner.getUser().getId()).orElse(null);
                    if (wallet != null) {
                        wallet.setBalance(wallet.getBalance()
                                .add(BigDecimal.valueOf(race.getEntryFee())));
                        walletRepository.save(wallet);
                    }

                    // Notify HorseOwner
                    notificationService.sendToUser(
                            owner.getUser().getId(),
                            "Registration Cancelled",
                            String.format("Registration for horse '%s' was cancelled because race '%s' closed. Entry fee refunded.",
                                    raceHorse.getHorse().getHorseName(),
                                    race.getRaceName()),
                            NotificationType.RACE_REJECTED,
                            raceHorse.getId()
                    );
                }
            }
        });

        // ← Xóa tất cả Pending chưa hoàn tất
        raceHorseRepository.deleteAll(pendingList);
    }


    @Override
    public void setOdds(SetAllOddsRequest request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // FIX: trước đây chỉ cho phép khi race ở trạng thái CLOSED_REGISTRATION,
        // khiến admin không thể set odds ở các giai đoạn khác. Nay chỉ chặn FINISHED và CANCELLED.
        if (race.getStatus() == RaceStatus.FINISHED || race.getStatus() == RaceStatus.CANCELLED) {
            throw new RuntimeException("Cannot set odds for a finished or cancelled race");
        }

        request.getOddsList().forEach(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            // Validate odds hợp lệ
            if (item.getOdds().compareTo(BigDecimal.ONE) <= 0) {
                throw new RuntimeException("Odds must be greater than 1");
            }

            raceHorse.setOdds(item.getOdds());
            raceHorseRepository.save(raceHorse);
        });
    }

    @Override
    public List<RaceHorseResponse> getPendingHorses() {
        return raceHorseRepository.findByStatus("Pending")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JockeyResponse> getAvaiableJockeyList(Long raceId) {
        List<Jockey> activeJockeys = jockeyRepository.findByStatus("Active");

        // Lấy danh sách jockey đã được assign trong race này
        List<Long> assignedJockeyIds = raceHorseRepository.findJockeyIdsByRaceId(raceId);

        // Lọc bỏ jockey đã có trong race này
        return activeJockeys.stream()
                .filter(jockey -> !assignedJockeyIds.contains(jockey.getId()))
                .map(j -> JockeyResponse.builder()
                        .id(j.getId())
                        .name(j.getUser().getFullName() != null
                                ? j.getUser().getFullName()
                                : j.getUser().getUsername())
                        .age(j.getAge())
                        .experienceYear(j.getExperienceYear())
                        .status(j.getStatus())
                        .build())
                .collect(Collectors.toList());
    }


    // ============ HorseOwner xin rút khỏi race ============
    @Override
    @Transactional
    public RaceHorseResponse requestWithdrawal(WithdrawalRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        // Check đúng owner không
        if (!raceHorse.getHorse().getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        // Chỉ cho rút khi race chưa bắt đầu
        Race race = raceHorse.getRace();
        if (race.getStatus() == RaceStatus.ONGOING ||
                race.getStatus() == RaceStatus.FINISHED ||
                race.getStatus() == RaceStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cannot withdraw after race has started or finished");
        }

        // Check status hợp lệ để rút
        if (raceHorse.getStatus().equals("Withdrawn") ||
                raceHorse.getStatus().equals("Rejected")) {
            throw new RuntimeException("This registration is already withdrawn or rejected");
        }

        // ← Đánh dấu đang chờ duyệt rút
        raceHorse.setStatus("WithdrawPending");
        raceHorse.setWithdrawReason(request.getReason());
        RaceHorse saved = raceHorseRepository.save(raceHorse);

        // Notify Admin
        notificationService.sendToAllAdmins(
                "⚠️ Withdrawal Request",
                String.format("Owner '%s' requested to withdraw horse '%s' from race '%s'. Reason: %s",
                        owner.getName(),
                        raceHorse.getHorse().getHorseName(),
                        race.getRaceName(),
                        request.getReason()),
                NotificationType.RACE_WITHDRAWAL,
                saved.getId()
        );

        return mapToResponse(saved);
    }

    // ============ Admin duyệt rút ============
    @Override
    @Transactional
    public RaceHorseResponse approveWithdrawal(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals("WithdrawPending")) {
            throw new RuntimeException("No pending withdrawal request");
        }

        Race race = raceHorse.getRace();
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        // ← Hoàn 50% phí tham gia
        if (race.getEntryFee() != null && race.getEntryFee() > 0) {
            BigDecimal refund = BigDecimal.valueOf(race.getEntryFee())
                    .multiply(BigDecimal.valueOf(0.5));  // hoàn 50%

            Wallet ownerWallet = walletRepository.findByUser_Id(owner.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));
            ownerWallet.setBalance(ownerWallet.getBalance().add(refund));
            walletRepository.save(ownerWallet);

            notificationService.sendToUser(
                    owner.getUser().getId(),
                    "✅ Withdrawal Approved",
                    String.format("Your withdrawal for horse '%s' from race '%s' was approved. 50%% entry fee (%s) refunded.",
                            raceHorse.getHorse().getHorseName(),
                            race.getRaceName(),
                            refund),
                    NotificationType.RACE_WITHDRAWAL,
                    raceHorseId
            );
        } else {
            notificationService.sendToUser(
                    owner.getUser().getId(),
                    "✅ Withdrawal Approved",
                    String.format("Your withdrawal for horse '%s' from race '%s' was approved.",
                            raceHorse.getHorse().getHorseName(),
                            race.getRaceName()),
                    NotificationType.RACE_WITHDRAWAL,
                    raceHorseId
            );
        }

        // ← Xóa horse khỏi race
        raceHorseRepository.deleteById(raceHorseId);

        return mapToResponse(raceHorse);
    }

    // ============ Admin từ chối rút ============
    @Override
    public RaceHorseResponse rejectWithdrawal(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals("WithdrawPending")) {
            throw new RuntimeException("No pending withdrawal request");
        }

        // Khôi phục status trước đó
        raceHorse.setStatus("Approved");
        raceHorse.setWithdrawReason(null);
        RaceHorse saved = raceHorseRepository.save(raceHorse);

        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow();

        notificationService.sendToUser(
                owner.getUser().getId(),
                "❌ Withdrawal Rejected",
                String.format("Your withdrawal request for horse '%s' was rejected. Horse remains in race '%s'.",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_WITHDRAWAL,
                raceHorseId
        );

        return mapToResponse(saved);
    }

    @Override
    public List<RaceHorseResponse> getWithdrawPending() {
        return raceHorseRepository.findByStatus("WithdrawPending")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RaceHorseResponse setOddsForOne(SetOddsRequest request) {
        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (request.getOdds().compareTo(BigDecimal.ONE) <= 0) {
            throw new RuntimeException("Odds must be greater than 1");
        }

        raceHorse.setOdds(request.getOdds());
        return mapToResponse(raceHorseRepository.save(raceHorse));
    }

    private RaceHorseResponse mapToResponse(RaceHorse raceHorse) {
        BigDecimal totalBet = betItemRepository
                .getTotalBetAmountByRaceHorse(raceHorse.getId());
        Long totalCount = betItemRepository
                .getTotalBetCountByRaceHorse(raceHorse.getId());

        return RaceHorseResponse.builder()
                .id(raceHorse.getId())
                .raceId(raceHorse.getRace().getId())
                .raceName(raceHorse.getRace().getRaceName())
                .horseId(raceHorse.getHorse().getId())
                .horseName(raceHorse.getHorse().getHorseName())
                .jockeyId(raceHorse.getJockey() != null ? raceHorse.getJockey().getId() : null)
                .jockeyName(raceHorse.getJockey() != null ? raceHorse.getJockey().getUser().getFullName() : null)
                .laneNumber(raceHorse.getLaneNumber())
                .startPosition(raceHorse.getStartPosition())
                .status(raceHorse.getStatus())
                .registerAt(raceHorse.getRegisterAt())
                .totalBetAmount(totalBet != null ? totalBet : BigDecimal.ZERO)
                .totalBetCount(totalCount != null ? totalCount : 0L)
                // FIX: trước đây bị hardcode là BigDecimal.valueOf(2.0) — odds thực tế trong DB không bao giờ được trả về.
                .odds(raceHorse.getOdds())
                .build();
    }
}