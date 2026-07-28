package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.*;
import com.horseracing.horseracingmanagement.common.exception.ResourceNotFoundException;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.RaceRevenueResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.RecentRaceStats;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.AuthMeResponse;
import com.horseracing.horseracingmanagement.module.dto.AuthDto.RegisterRequest;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.AdminUserService;
import com.horseracing.horseracingmanagement.module.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final HorseRepository horseRepository;
    private final RaceRepository raceRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepostitory transactionRepository;
    private final AuthService authService;
    private final BetItemRepository betItemRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final JockeyRepository jockeyRepository;
    private final TrainerRepository trainerRepository;
    private final RaceRefereeRepository raceRefereeRepository;
    private final RaceResultRepository raceResultRepository;



    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserItemResponse> getUsers(int page, int size, String keyword, RoleName role, UserStatus status) {
        String keywordFilter = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        Page<User> users = userRepository.findWithFilters(
                keywordFilter,
                status,
                role,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return PageResponse.from(users.map(this::toItem));
    }

    @Override
    @Transactional
    public void updateRole(Long userId, RoleName roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Role role = roleRepository.findByRolename(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        RoleName oldRoleName = user.getRole() != null ? user.getRole().getRolename() : null;

        user.setRole(role);
        userRepository.save(user);

        if (oldRoleName == roleName) {
            return;
        }

        deactivateProfileForRole(user, oldRoleName);

        activateOrCreateProfileForRole(user, roleName);
    }

    private void deactivateProfileForRole(User user, RoleName oldRole) {
        if (oldRole == null) return;
        switch (oldRole) {
            case HORSE_OWNER -> horseOwnerRepository.findByUserId(user.getId())
                    .ifPresent(o -> {
                        o.setStatus("Inactive");
                        horseOwnerRepository.save(o);
                    });
            case JOCKEY -> jockeyRepository.findByUser_Id(user.getId())
                    .ifPresent(j -> {
                        j.setStatus("Inactive");
                        jockeyRepository.save(j);
                    });
            case TRAINER -> trainerRepository.findByUser_Id(user.getId())
                    .ifPresent(t -> {
                        t.setStatus("Inactive");
                        trainerRepository.save(t);
                    });
            case REFEREE -> raceRefereeRepository.findByUser_Id(user.getId())
                    .ifPresent(r -> {
                        r.setStatus("Inactive");
                        raceRefereeRepository.save(r);
                    });
            default -> { /* ADMIN, STAFF, SPECTATOR, USER, MANAGER — không có profile riêng */ }
        }
    }

    private void activateOrCreateProfileForRole(User user, RoleName newRole) {
        String displayName = user.getFullName() != null ? user.getFullName() : user.getUsername();

        switch (newRole) {
            case HORSE_OWNER -> {
                HorseOwner owner = horseOwnerRepository.findByUserId(user.getId()).orElse(null);
                if (owner != null) {
                    owner.setStatus("Active");
                    horseOwnerRepository.save(owner);
                } else {
                    horseOwnerRepository.save(HorseOwner.builder()
                            .user(user)
                            .name(displayName)
                            .status("Active")
                            .totalHorses(0)
                            .build());
                }
            }
            case JOCKEY -> {
                Jockey jockey = jockeyRepository.findByUser_Id(user.getId()).orElse(null);
                if (jockey != null) {
                    jockey.setStatus("Active");
                    jockeyRepository.save(jockey);
                } else {
                    jockeyRepository.save(Jockey.builder()
                            .user(user)
                            .status("Active")
                            .build());
                }
            }
            case TRAINER -> {
                Trainer trainer = trainerRepository.findByUser_Id(user.getId()).orElse(null);
                if (trainer != null) {
                    trainer.setStatus("Active");
                    trainerRepository.save(trainer);
                } else {
                    trainerRepository.save(Trainer.builder()
                            .user(user)
                            .name(displayName)
                            .status("Active")
                            .build());
                }
            }
            case REFEREE -> {
                RaceReferee referee = raceRefereeRepository.findByUser_Id(user.getId()).orElse(null);
                if (referee != null) {
                    referee.setStatus("Active");
                    raceRefereeRepository.save(referee);
                } else {
                    raceRefereeRepository.save(RaceReferee.builder()
                            .user(user)
                            .status("Active")
                            .build());
                }
            }
            default -> { /* ADMIN, STAFF, SPECTATOR, USER, MANAGER — không cần profile riêng */ }
        }
    }

    @Override
    @Transactional
    public void updateStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Không cho hạ trạng thái một tài khoản ADMIN qua endpoint này. Trước đây STAFF
        // thừa quyền từ @PreAuthorize ở cấp class nên có thể ban chính admin — khoá cả ở
        // tầng service để không phụ thuộc vào annotation ở controller.
        if (user.getRole() != null && user.getRole().getRolename() == RoleName.ADMIN) {
            throw new IllegalStateException("Cannot change status of an ADMIN account");
        }

        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Xóa mềm — set status BANNED thay vì xóa thật (giữ data lịch sử)
        user.setStatus(UserStatus.BANNED);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteHorse(Long horseId) {
        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new ResourceNotFoundException("Horse", "id", horseId));

        // Check horse có đang trong race không
        List<RaceHorse> activeRaces = raceHorseRepository.findByHorse_Id(horseId)
                .stream()
                .filter(rh -> rh.getStatus() == RaceHorseStatus.APPROVED
                        || rh.getStatus() == RaceHorseStatus.PENDING_ADMIN
                        || rh.getStatus() == RaceHorseStatus.PENDING_JOCKEY)
                .collect(Collectors.toList());

        if (!activeRaces.isEmpty()) {
            throw new RuntimeException(
                    "Cannot delete horse that is currently registered in a race");
        }

        horse.setStatus(HorseStatus.BANNED);  // ← thêm BANNED vào HorseStatus enum
        horseRepository.save(horse);
    }

    @Override
    public AuthMeResponse createUserAccout(RegisterRequest request) {
        return authService.register(request);
    }

    @Override
    public AdminStatsResponse getStats() {
        // ← Wallet admin
        BigDecimal adminBalance = userRepository.findFirstByRole_Rolename(RoleName.ADMIN)
                .flatMap(u -> walletRepository.findByUser_Id(u.getId()))
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        // ← Transaction — dùng aggregate thay vì findAll()
        BigDecimal totalDeposit = transactionRepository.sumApprovedByType("DEPOSIT");
        BigDecimal totalWithdraw = transactionRepository.sumApprovedByType("WITHDRAW");
        long pendingDeposits = transactionRepository.countPendingByType("DEPOSIT");
        long pendingWithdraws = transactionRepository.countPendingByType("WITHDRAW");

        // ← Race — dùng countByStatus
        long totalRaces = raceRepository.count();
        long finishedRaces = raceRepository.countByStatus(RaceStatus.FINISHED);
        long ongoingRaces = raceRepository.countByStatus(RaceStatus.ONGOING);
        long upcomingRaces = raceRepository.countByStatus(RaceStatus.UPCOMING)
                + raceRepository.countByStatus(RaceStatus.OPEN_REGISTRATION);
        long cancelledRaces = raceRepository.countByStatus(RaceStatus.CANCELLED);

        // ← Entry fee — dùng query thay vì flatMap
        BigDecimal totalEntryFee = raceHorseRepository.sumEntryFeeCollected();

        // ← Prize pool
        BigDecimal totalPrizeFunded = raceRepository.sumTotalPrizePool();

        // ← Bet lost
        BigDecimal totalBetLost = betItemRepository.sumLostBetAmount();

        // ← User — dùng countByRoleName
        long totalUsers = userRepository.count();
        long totalHorseOwners = userRepository.countByRoleName(RoleName.HORSE_OWNER);
        long totalTrainers = userRepository.countByRoleName(RoleName.TRAINER);
        long totalJockeys = userRepository.countByRoleName(RoleName.JOCKEY);
        long totalReferees = userRepository.countByRoleName(RoleName.REFEREE);
        long totalSpectators = userRepository.countByRoleName(RoleName.SPECTATOR);

        // ← Horse
        long totalHorses = horseRepository.count();
        long activeHorses = horseRepository.countByStatus(HorseStatus.ACTIVE);
        long racingHorses = horseRepository.countByStatus(HorseStatus.RACING);

        // ← Recent 5 races — dùng Pageable
        List<RecentRaceStats> recentRaces = raceRepository
                .findByStatusOrderByStartTimeDesc(
                        RaceStatus.FINISHED,
                        PageRequest.of(0, 5))
                .stream()
                .map(r -> RecentRaceStats.builder()
                        .raceId(r.getId())
                        .raceName(r.getRaceName())
                        .status(r.getStatus().name())
                        .startTime(r.getStartTime())
                        .totalHorses(raceHorseRepository.countByRace_Id(r.getId()))
                        .totalBets(betRepository.countByRace_Id(r.getId()))
                        .prizePool(r.getTotalprizepool())
                        .build())
                .collect(Collectors.toList());

        return AdminStatsResponse.builder()
                .adminWalletBalance(adminBalance)
                .totalDepositApproved(totalDeposit)
                .totalWithdrawApproved(totalWithdraw)
                .totalEntryFeeCollected(totalEntryFee)
                .totalPrizePoolFunded(totalPrizeFunded)
                .totalBetLost(totalBetLost)
                .totalRaces(totalRaces)
                .totalFinishedRaces(finishedRaces)
                .totalOngoingRaces(ongoingRaces)
                .totalUpcomingRaces(upcomingRaces)
                .totalCancelledRaces(cancelledRaces)
                .totalUsers(totalUsers)
                .totalHorseOwners(totalHorseOwners)
                .totalTrainers(totalTrainers)
                .totalJockeys(totalJockeys)
                .totalReferees(totalReferees)
                .totalSpectators(totalSpectators)
                .totalHorses(totalHorses)
                .totalActiveHorses(activeHorses)
                .totalRacingHorses(racingHorses)
                .totalPendingDeposits(pendingDeposits)
                .totalPendingWithdraws(pendingWithdraws)
                .recentRaces(recentRaces)
                .build();
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<RaceRevenueResponse> getRaceRevenue(int page, int size, Instant from, Instant to) {
        // Truyền biên cụ thể thay vì null: JPQL dạng ":from IS NULL OR ..." hay làm
        // PostgreSQL báo "could not determine data type of parameter" với kiểu timestamp.
        Instant fromSafe = (from != null) ? from : Instant.EPOCH;
        Instant toSafe   = (to   != null) ? to   : Instant.now().plus(365, ChronoUnit.DAYS);

        Page<Race> races = raceRepository.findForRevenueReport(
                fromSafe, toSafe, PageRequest.of(page, size, Sort.by("startTime").descending()));

        return PageResponse.from(races.map(this::toRaceRevenue));
    }

    private RaceRevenueResponse toRaceRevenue(Race race) {
        BigDecimal entryFee  = nz(raceHorseRepository.sumEntryFeeByRaceId(race.getId()));
        BigDecimal handle    = nz(betItemRepository.sumHandleByRaceId(race.getId()));
        BigDecimal payout    = nz(betItemRepository.sumPayoutByRaceId(race.getId()));
        Long prizeRaw        = raceResultRepository.sumRewardsByRaceId(race.getId());
        BigDecimal prizePaid = prizeRaw == null ? BigDecimal.ZERO : BigDecimal.valueOf(prizeRaw);

        // Phần hệ thống thực sự giữ lại từ cược — không phải toàn bộ handle.
        BigDecimal betMargin  = handle.subtract(payout);
        BigDecimal netRevenue = entryFee.add(betMargin).subtract(prizePaid);

        BigDecimal turnover = entryFee.add(handle);
        Double marginPercent = turnover.compareTo(BigDecimal.ZERO) == 0
                ? 0d
                : netRevenue.multiply(BigDecimal.valueOf(100))
                .divide(turnover, 2, RoundingMode.HALF_UP)
                .doubleValue();

        return RaceRevenueResponse.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status(race.getStatus() != null ? race.getStatus().name() : null)
                .startTime(race.getStartTime())
                .totalHorses(raceHorseRepository.countApprovedByRaceId(race.getId()))
                .totalBets(betRepository.countByRace_Id(race.getId()))
                .entryFeeCollected(entryFee)
                .betHandle(handle)
                .betPayout(payout)
                .prizePaid(prizePaid)
                .betMargin(betMargin)
                .netRevenue(netRevenue)
                .marginPercent(marginPercent)
                .build();
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private AdminUserItemResponse toItem(User user) {
        String roleName = user.getRole() != null
                ? user.getRole().getRolename().name()
                : RoleName.SPECTATOR.name();
        return AdminUserItemResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhonenumber())
                .role(roleName)
                .status(user.getStatus().name())
                .createdAt(
                        user.getCreatedAt() == null
                                ? null
                                : LocalDateTime.ofInstant(
                                user.getCreatedAt(),
                                ZoneId.systemDefault()
                        )
                )
                .build();
    }
}
