package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.*;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.WithdrawalRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyRequestDto;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.*;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceHorseServiceImpl implements RaceHorseService {

    private final RaceHorseRepository raceHorseRepository;
    private final RaceRepository raceRepository;
    private final HorseRepository horseRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final JockeyRepository jockeyRepository;
    private final TrainerRepository trainerRepository;
    private final BetItemRepository betItemRepository;
    private final WalletRepository walletRepository;
    private final PenaltyRepository penaltyRepository;
    private final UserRepository userRepository;
    private final RaceResultRepository raceResultRepository;

    private final NotificationService notificationService;

    // ← FIX: helper dùng chung cho mọi chỗ cộng/trừ entry fee vào ví admin,
    // để 4 luồng (đăng ký, reject, cleanup khi đóng đăng ký, duyệt rút lui)
    // luôn đối xứng với nhau — tránh chỗ trừ user mà quên cộng/trừ admin.
    private Wallet getAdminWallet() {
        User adminUser = userRepository.findFirstByRole_Rolename(RoleName.ADMIN)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return walletRepository.findByUser_Id(adminUser.getId())
                .orElseThrow(() -> new RuntimeException("Admin wallet not found"));
    }
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

        if (horse.getStatus() == HorseStatus.BANNED) {
            throw new RuntimeException("This horse has been banned and cannot race");
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
            // ← Dùng findByUserId thay vì owner.getUser().getId() để tránh lazy load issue
            Wallet ownerWallet = walletRepository.findByUser_Id(userId)  // ← dùng userId trực tiếp từ JWT
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));

            if (ownerWallet.getBalance().compareTo(BigDecimal.valueOf(race.getEntryFee())) < 0) {
                throw new RuntimeException("Insufficient balance to pay entry fee. Required: "
                        + race.getEntryFee());
            }

            ownerWallet.setBalance(ownerWallet.getBalance()
                    .subtract(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(ownerWallet);

            // ← FIX: entry fee phải cộng vào ví admin ngay lúc thu, không thì tiền
            // biến mất khỏi hệ thống (trước đây chỉ trừ owner, không cộng đâu cả).
            // Mọi chỗ hoàn phí (reject/cleanup/withdraw) đã được sửa để trừ lại từ
            // đây một cách đối xứng.
            Wallet adminWallet = getAdminWallet();
            adminWallet.setBalance(adminWallet.getBalance()
                    .add(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(adminWallet);
        }
        // ← Tạo RaceHorse với status "PendingJockey" — chưa gắn jockey
        RaceHorse saved = raceHorseRepository.save(RaceHorse.builder()
                .race(race)
                .horse(horse)
                .jockey(null)  // ← chưa có jockey
                .status(RaceHorseStatus.PENDING_JOCKEY)
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

        if (!raceHorse.getStatus().equals(RaceHorseStatus.PENDING_JOCKEY) &&
                !raceHorse.getStatus().equals(RaceHorseStatus.JOCKEY_REJECTED)) {
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
        raceHorse.setStatus(RaceHorseStatus.PENDING_JOCKEY);

        if (request.getJockeyRevenuePercent() != null) {
            raceHorse.setJockeyRevenuePercent(request.getJockeyRevenuePercent());
            raceHorse.setOwnerRevenuePercent(
                    BigDecimal.valueOf(100).subtract(request.getJockeyRevenuePercent()));
        }

        raceHorseRepository.save(raceHorse);

        // Notify Jockey
        Race race = raceHorse.getRace();
        HorseOwner owner1 = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId()).orElse(null);
        Trainer trainer = raceHorse.getHorse().getTrainerId() != null
                ? trainerRepository.findById(raceHorse.getHorse().getTrainerId()).orElse(null)
                : null;

        notificationService.sendToUser(
                jockey.getUser().getId(),
                "🏇 Jockey Request!",
                String.format("""
                You have been invited to ride horse '%s' in race '%s'.
                👤 Owner: %s
                🎓 Trainer: %s
                🏆 Prize Pool: %s
                💰 Your Share: %s%%
                📅 Race Date: %s
                Please accept or decline.""",
                        raceHorse.getHorse().getHorseName(),
                        race.getRaceName(),
                        owner1 != null ? owner1.getName() : "N/A",
                        trainer != null && trainer.getUser() != null
                                ? trainer.getUser().getFullName() : "N/A",
                        race.getTotalprizepool(),
                        request.getJockeyRevenuePercent() != null
                                ? request.getJockeyRevenuePercent() : "10",
                        race.getStartTime()),
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

        if (!raceHorse.getStatus().equals(RaceHorseStatus.PENDING_JOCKEY)) {
            throw new RuntimeException("No pending jockey request");
        }

        // ← Jockey chấp nhận → chuyển sang chờ Admin duyệt
        raceHorse.setStatus(RaceHorseStatus.PENDING_ADMIN);
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
        raceHorse.setStatus(RaceHorseStatus.JOCKEY_REJECTED);
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
        return raceHorseRepository.findByJockey_IdAndStatus(jockey.getId(), RaceHorseStatus.PENDING_JOCKEY)
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
    @Transactional
    public RaceHorseResponse approveHorse(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals(RaceHorseStatus.PENDING_ADMIN)) {
            throw new RuntimeException("Horse must be PendingAdmin to approve");
        }

        raceHorse.setStatus(RaceHorseStatus.APPROVED);
        RaceHorse saved = raceHorseRepository.save(raceHorse);

        // ← Đổi status Horse → RACING
        Horse horse = raceHorse.getHorse();
        horse.setStatus(HorseStatus.RACING);
        horseRepository.save(horse);  // ← inject HorseRepository

        HorseOwner ho = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        notificationService.sendToUser(
                ho.getUser().getId(),
                "🎉 Registration Approved!",
                String.format("Your horse '%s' has been approved for race '%s'! Status changed to RACING.",
                        raceHorse.getHorse().getHorseName(),
                        raceHorse.getRace().getRaceName()),
                NotificationType.RACE_APPROVED,
                raceHorseId
        );

        return mapToResponse(saved);
    }
    @Override
    @Transactional
    public RaceHorseResponse rejectHorse(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals(RaceHorseStatus.PENDING_ADMIN)) {
            throw new RuntimeException("Horse must be PendingAdmin to reject");
        }

        HorseOwner ho = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Horse horse = raceHorse.getHorse();
        horse.setStatus(HorseStatus.ACTIVE);  // ← trả về ACTIVE
        horseRepository.save(horse);

        // ← Hoàn phí tham gia nếu có
        Race race = raceHorse.getRace();
        if (race.getEntryFee() != null && race.getEntryFee() > 0) {
            Wallet ownerWallet = walletRepository.findByUser_Id(ho.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));
            ownerWallet.setBalance(ownerWallet.getBalance()
                    .add(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(ownerWallet);

            // ← FIX: entry fee đã được cộng vào ví admin lúc đăng ký, nên hoàn
            // tiền cho owner thì phải trừ lại từ admin cho đối xứng.
            Wallet adminWallet = getAdminWallet();
            adminWallet.setBalance(adminWallet.getBalance()
                    .subtract(BigDecimal.valueOf(race.getEntryFee())));
            walletRepository.save(adminWallet);
        }
        raceHorse.setStatus(RaceHorseStatus.REJECTED);
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



    @Transactional
    public void cleanupPendingOnClose(Long raceId) {
        List<RaceHorse> pendingList = raceHorseRepository
                .findByRace_IdAndStatusIn(raceId,
                        List.of(RaceHorseStatus.PENDING_JOCKEY, RaceHorseStatus.JOCKEY_REJECTED));

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

                        // ← FIX: trừ lại ví admin cho đối xứng với lúc thu entry fee
                        Wallet adminWallet = getAdminWallet();
                        adminWallet.setBalance(adminWallet.getBalance()
                                .subtract(BigDecimal.valueOf(race.getEntryFee())));
                        walletRepository.save(adminWallet);
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
    @Transactional
    public void setOdds(SetAllOddsRequest request) {
        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // ← đổi check sang SETTING_ODDS
        if (race.getStatus() != RaceStatus.SETTING_ODDS) {
            throw new RuntimeException("Can only set odds when race is SETTING_ODDS");
        }

        request.getOddsList().forEach(item -> {
            RaceHorse raceHorse = raceHorseRepository.findById(item.getRaceHorseId())
                    .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

            if (item.getOdds().compareTo(BigDecimal.ONE) <= 0) {
                throw new RuntimeException("Odds must be greater than 1");
            }

            raceHorse.setOdds(item.getOdds());
            raceHorseRepository.save(raceHorse);
        });
    }

    @Override
    public List<RaceHorseResponse> getPendingHorses() {
        return raceHorseRepository.findByStatus(RaceHorseStatus.PENDING_ADMIN)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<JockeyResponse> getAvaiableJockeyList(Long raceId) {
        List<Jockey> activeJockeys = jockeyRepository.findByStatus("Active");

        // Lấy danh sách jockey đã được assign trong race này
        List<Long> assignedJockeyIds = raceHorseRepository.findJockeyIdsByRaceId(raceId);

        // Lọc bỏ jockey đã có trong race này + jockey bị banned
        return activeJockeys.stream()
                .filter(jockey -> !assignedJockeyIds.contains(jockey.getId()))
                .filter(jockey -> jockey.getUser() != null && jockey.getUser().getStatus() != UserStatus.BANNED)
                .map(j -> JockeyResponse.builder()
                        .id(j.getId())
                        .name(j.getUser().getFullName() != null
                                ? j.getUser().getFullName()
                                : j.getUser().getUsername())
                        .dateOfBirth(j.getDateOfBirth())
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
        if (raceHorse.getStatus().equals(RaceHorseStatus.WITHDRAWN) ||
                raceHorse.getStatus().equals(RaceHorseStatus.REJECTED)) {
            throw new RuntimeException("This registration is already withdrawn or rejected");
        }

        // ← Đánh dấu đang chờ duyệt rút
        raceHorse.setStatus(RaceHorseStatus.WITHDRAW_PENDING);
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

        if (!raceHorse.getStatus().equals(RaceHorseStatus.WITHDRAW_PENDING)) {
            throw new RuntimeException("No pending withdrawal request");
        }

        Race race = raceHorse.getRace();
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        Horse horse = raceHorse.getHorse();
        horse.setStatus(HorseStatus.ACTIVE);  // ← trả về ACTIVE
        horseRepository.save(horse);

        // ← Hoàn 50% phí tham gia
        if (race.getEntryFee() != null && race.getEntryFee() > 0) {
            BigDecimal refund = BigDecimal.valueOf(race.getEntryFee())
                    .multiply(BigDecimal.valueOf(0.5));  // hoàn 50%

            Wallet ownerWallet = walletRepository.findByUser_Id(owner.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("Owner wallet not found"));
            ownerWallet.setBalance(ownerWallet.getBalance().add(refund));
            walletRepository.save(ownerWallet);

            // ← FIX: chỉ trừ đúng phần đã hoàn (50%) khỏi ví admin — 50% còn lại
            // admin giữ lại làm phí phạt rút lui, không hoàn lại nên không trừ.
            Wallet adminWallet = getAdminWallet();
            adminWallet.setBalance(adminWallet.getBalance().subtract(refund));
            walletRepository.save(adminWallet);

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
    @Transactional
    public RaceHorseResponse rejectWithdrawal(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        if (!raceHorse.getStatus().equals(RaceHorseStatus.WITHDRAW_PENDING)) {
            throw new RuntimeException("No pending withdrawal request");
        }

        // Khôi phục status trước đó
        raceHorse.setStatus(RaceHorseStatus.APPROVED);
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
        return raceHorseRepository.findByStatus(RaceHorseStatus.WITHDRAW_PENDING)
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

    @Override
    public List<String> getPreRaceIssues(Long raceId) {
        List<RaceHorse> approvedHorses = raceHorseRepository
                .findByRace_IdAndStatus(raceId, RaceHorseStatus.APPROVED);

        List<String> issues = new ArrayList<>();
        for (RaceHorse rh : approvedHorses) {
            if (rh.getHorse().getStatus() == HorseStatus.INACTIVE
                    || rh.getHorse().getStatus() == HorseStatus.RETIRED) {
                issues.add("Horse '" + rh.getHorse().getHorseName() + "' is not fit to race");
            }

            if (rh.getJockey() == null) {
                issues.add("Horse '" + rh.getHorse().getHorseName() + "' has no jockey");
            } else if (!"Active".equalsIgnoreCase(rh.getJockey().getStatus())) {
                issues.add("Jockey '" + rh.getJockey().getUser().getFullName() + "' is not active");
            }

            if (rh.getOdds() == null) {
                issues.add("Horse '" + rh.getHorse().getHorseName() + "' has no odds");
            }

            if (rh.getJockey() != null) {
                boolean doubleBooked = approvedHorses.stream().anyMatch(other ->
                        other.getJockey() != null
                                && other.getJockey().getId().equals(rh.getJockey().getId())
                                && !other.getId().equals(rh.getId()));
                if (doubleBooked) {
                    issues.add("Jockey '" + rh.getJockey().getUser().getFullName() + "' is assigned to multiple horses");
                }
            }

            boolean verified = Boolean.TRUE.equals(rh.getVerifiedOk());
            boolean reported = !penaltyRepository.findByRaceHorse_Id(rh.getId()).isEmpty();
            if (!verified && !reported) {
                issues.add("Horse '" + rh.getHorse().getHorseName() + "' has not been checked by the referee yet");
            }
        }
        return issues;
    }

    @Override
    public HorseEligibilityResponse checkEligibility(Long raceId, Long horseId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));
        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        List<String> reasons = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        long earnings = raceResultRepository.sumRewardsByHorseId(horseId) != null
                ? raceResultRepository.sumRewardsByHorseId(horseId) : 0L;

        // ---- Age ----
        if (race.getMinAge() != null
                && (horse.getAge() == null || horse.getAge() < race.getMinAge())) {
            reasons.add("Horse does not meet the minimum age requirement (" + race.getMinAge() + " years)");
        }

        if (race.getMaxAge() != null
                && horse.getAge() != null && horse.getAge() > race.getMaxAge()) {
            reasons.add("Horse exceeds the maximum age limit (" + race.getMaxAge() + " years)");
        }

// ---- Gender ----
        if (race.getGenderRestriction() != null && !race.getGenderRestriction().isBlank()
                && !race.getGenderRestriction().equalsIgnoreCase(horse.getGender())) {
            reasons.add("This race is restricted to " + race.getGenderRestriction() + " horses");
        }

// ---- Race Class & Earnings ----
        RaceClass rc = race.getRaceClass();
        if (rc != null) {
            if (rc == RaceClass.MAIDEN
                    && raceResultRepository.countWinsByHorseId(horseId) > 0) {
                reasons.add("MAIDEN races are only open to horses that have never won a race");
            }

            Long min = race.getMinEarnings() != null
                    ? race.getMinEarnings() : rc.getDefaultMinEarnings();
            Long max = race.getMaxEarnings() != null
                    ? race.getMaxEarnings() : rc.getDefaultMaxEarnings();

            if (min != null && earnings < min) {
                reasons.add("Accumulated earnings do not meet the minimum requirement for "
                        + rc.name() + " class (" + min + ")");
            }

            if (max != null && earnings > max) {
                reasons.add("Accumulated earnings exceed the maximum limit for "
                        + rc.name() + " class (" + max + ") — the horse must compete in a higher class");
            }
        } else {
            // No race class specified; validate earnings independently
            if (race.getMinEarnings() != null && earnings < race.getMinEarnings()) {
                reasons.add("Accumulated earnings are below the required minimum (" + race.getMinEarnings() + ")");
            }

            if (race.getMaxEarnings() != null && earnings > race.getMaxEarnings()) {
                reasons.add("Accumulated earnings exceed the allowed maximum (" + race.getMaxEarnings() + ")");
            }
        }

// ---- Distance & Surface: WARNING ONLY, do not block ----
        DistanceCategory raceCat = DistanceCategory.fromMeters(race.getDistanceMeters());

        if (raceCat != null && horse.getPreferredDistance() != null
                && horse.getPreferredDistance() != raceCat) {
            warnings.add("Horse's preferred distance is "
                    + horse.getPreferredDistance()
                    + ", but this race is in the "
                    + raceCat + " category");
        }

        if (race.getSurfaceType() != null && horse.getPreferredSurface() != null
                && !race.getSurfaceType().equalsIgnoreCase(horse.getPreferredSurface())) {
            warnings.add("Horse is accustomed to "
                    + horse.getPreferredSurface()
                    + " surface, but this race is run on "
                    + race.getSurfaceType());
        }

        return HorseEligibilityResponse.builder()
                .horseId(horseId)
                .horseName(horse.getHorseName())
                .raceId(raceId)
                .eligible(reasons.isEmpty())
                .reasons(reasons)
                .warnings(warnings)
                .horseEarnings(earnings)
                .build();
    }

    private RaceHorseResponse mapToResponse(RaceHorse raceHorse) {
        BigDecimal totalBet = betItemRepository
                .getTotalBetAmountByRaceHorse(raceHorse.getId());
        Long totalCount = betItemRepository
                .getTotalBetCountByRaceHorse(raceHorse.getId());

        Race race = raceHorse.getRace();
        Horse horse = raceHorse.getHorse();

        // Chủ ngựa
        HorseOwner owner = horse.getOwnerId() != null
                ? horseOwnerRepository.findById(horse.getOwnerId()).orElse(null)
                : null;

        // Trainer
        Trainer trainer = horse.getTrainerId() != null
                ? trainerRepository.findById(horse.getTrainerId()).orElse(null)
                : null;

        return RaceHorseResponse.builder()
                .id(raceHorse.getId())
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .raceStatus(race.getStatus() != null ? race.getStatus().name() : null)
                .trackName(race.getTrackName())
                .location(race.getLocation())
                .raceDate(race.getRaceDate())
                .startTime(race.getStartTime())
                .registrationDeadline(race.getRegistrationDeadline())
                .entryFee(race.getEntryFee())
                .totalPrizePool(race.getTotalprizepool())
                .horseId(horse.getId())
                .horseName(horse.getHorseName())
                .ownerId(owner != null ? owner.getId() : null)
                .ownerName(owner != null ? owner.getName() : null)
                .trainerId(trainer != null ? trainer.getId() : null)
                .trainerName(trainer != null && trainer.getUser() != null
                        ? trainer.getUser().getFullName() : null)
                .jockeyId(raceHorse.getJockey() != null ? raceHorse.getJockey().getId() : null)
                .jockeyName(raceHorse.getJockey() != null ? raceHorse.getJockey().getUser().getFullName() : null)
                .jockeyRevenuePercent(raceHorse.getJockeyRevenuePercent())
                .ownerRevenuePercent(raceHorse.getOwnerRevenuePercent())
                .laneNumber(raceHorse.getLaneNumber())
                .startPosition(raceHorse.getStartPosition())
                .status(raceHorse.getStatus().name())
                .registerAt(raceHorse.getRegisterAt())
                .withdrawReason(raceHorse.getWithdrawReason())
                .totalBetAmount(totalBet != null ? totalBet : BigDecimal.ZERO)
                .totalBetCount(totalCount != null ? totalCount : 0L)
                // FIX: trước đây bị hardcode là BigDecimal.valueOf(2.0) — odds thực tế trong DB không bao giờ được trả về.
                .odds(raceHorse.getOdds())
                .build();
    }
}