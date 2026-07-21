package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.*;
import com.horseracing.horseracingmanagement.common.exception.ResourceNotFoundException;
import com.horseracing.horseracingmanagement.common.response.PageResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminStatsResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.AdminUserItemResponse;
import com.horseracing.horseracingmanagement.module.dto.AdminDto.RecentRaceStats;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.CreateReportRequest;
import com.horseracing.horseracingmanagement.module.dto.ReportDto.ReportResponse;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final HorseRepository horseRepository;
    private  final  ReportRepository reportRepository;
    private final RaceRepository raceRepository;
    private final BetRepository betRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepostitory transactionRepository;



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

        user.setRole(role);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void updateStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
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
    @Transactional
    public ReportResponse createReport(CreateReportRequest request, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", reporterId));

        // Lấy tên của target
        String targetName = "Unknown";
        if ("USER".equals(request.getTargetType())) {
            targetName = userRepository.findById(request.getTargetId())
                    .map(u -> u.getFullName() != null ? u.getFullName() : u.getEmail())
                    .orElse("Unknown user");
        } else if ("HORSE".equals(request.getTargetType())) {
            targetName = horseRepository.findById(request.getTargetId())
                    .map(Horse::getHorseName)
                    .orElse("Unknown horse");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .targetName(targetName)
                .reason(request.getReason())
                .detail(request.getDetail())
                .status("PENDING")
                .build();

        return mapToReportResponse(reportRepository.save(report));
    }


    @Override
    public List<ReportResponse> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream().map(this::mapToReportResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ReportResponse reviewReport(Long reportId, String action, String adminNote, Long adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));

        switch (action) {
            case "DISMISS" -> {
                report.setStatus("DISMISSED");
                report.setAdminNote(adminNote);
            }
            case "BAN_USER" -> {
                deleteUser(report.getTargetId());
                report.setStatus("ACTION_TAKEN");
                report.setAdminNote("User banned. " + (adminNote != null ? adminNote : ""));
            }
            case "BAN_HORSE" -> {
                deleteHorse(report.getTargetId());
                report.setStatus("ACTION_TAKEN");
                report.setAdminNote("Horse banned. " + (adminNote != null ? adminNote : ""));
            }
            default -> throw new RuntimeException("Invalid action: " + action);
        }

        report.setReviewedAt(Instant.now());
        return mapToReportResponse(reportRepository.save(report));
    }

    @Override
    public AdminStatsResponse getStats() {
        // Wallet admin
        BigDecimal adminBalance = userRepository.findFirstByRole_Rolename(RoleName.ADMIN)
                .flatMap(u -> walletRepository.findByUser_Id(u.getId()))
                .map(Wallet::getBalance)
                .orElse(BigDecimal.ZERO);

        // Transaction stats
        List<TransactionRequest> allTx = transactionRepository.findAll();
        BigDecimal totalDeposit = allTx.stream()
                .filter(t -> "DEPOSIT".equals(t.getRequestType())
                        && "APPROVED".equals(t.getRequestStatus()))
                .map(t -> BigDecimal.valueOf(t.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalWithdraw = allTx.stream()
                .filter(t -> "WITHDRAW".equals(t.getRequestType())
                        && "APPROVED".equals(t.getRequestStatus()))
                .map(t -> BigDecimal.valueOf(t.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingDeposits = allTx.stream()
                .filter(t -> "DEPOSIT".equals(t.getRequestType())
                        && "PENDING".equals(t.getRequestStatus())).count();

        long pendingWithdraws = allTx.stream()
                .filter(t -> "WITHDRAW".equals(t.getRequestType())
                        && "PENDING".equals(t.getRequestStatus())).count();


        // Race stats
        List<Race> allRaces = raceRepository.findAll();
        long totalRaces = allRaces.size();
        long finishedRaces = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.FINISHED).count();
        long ongoingRaces = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.ONGOING).count();
        long upcomingRaces = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.UPCOMING
                        || r.getStatus() == RaceStatus.OPEN_REGISTRATION).count();
        long cancelledRaces = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.CANCELLED).count();

        // Entry fee collected
        BigDecimal totalEntryFee = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.FINISHED && r.getEntryFee() != null)
                .flatMap(r -> raceHorseRepository.findByRace_Id(r.getId()).stream())
                .filter(rh -> rh.getStatus() == RaceHorseStatus.FINISHED
                        || rh.getStatus() == RaceHorseStatus.APPROVED)
                .map(rh -> rh.getRace().getEntryFee() != null
                        ? BigDecimal.valueOf(rh.getRace().getEntryFee())
                        : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Prize pool funded
        BigDecimal totalPrizeFunded = allRaces.stream()
                .filter(r -> r.getTotalprizepool() != null)
                .map(r -> BigDecimal.valueOf(r.getTotalprizepool()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        // User stats
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.size();
        long totalHorseOwners = allUsers.stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRolename() == RoleName.HORSE_OWNER).count();
        long totalTrainers = allUsers.stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRolename() == RoleName.TRAINER).count();
        long totalJockeys = allUsers.stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRolename() == RoleName.JOCKEY).count();
        long totalReferees = allUsers.stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRolename() == RoleName.REFEREE).count();
        long totalSpectators = allUsers.stream()
                .filter(u -> u.getRole() != null
                        && u.getRole().getRolename() == RoleName.SPECTATOR).count();

        // Horse stats
        List<Horse> allHorses = horseRepository.findAll();
        long totalHorses = allHorses.size();
        long activeHorses = allHorses.stream()
                .filter(h -> h.getStatus() == HorseStatus.ACTIVE).count();
        long racingHorses = allHorses.stream()
                .filter(h -> h.getStatus() == HorseStatus.RACING).count();


        // Reports
        long pendingReports = reportRepository.countByStatus("PENDING");

        // Recent 5 races
        List<RecentRaceStats> recentRaces = allRaces.stream()
                .filter(r -> r.getStatus() == RaceStatus.FINISHED)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .limit(5)
                .map(r -> {
                    long totalHorsesInRace = raceHorseRepository.countByRace_Id(r.getId());
                    long totalBetsInRace = betRepository.countByRace_Id(r.getId());
                    return RecentRaceStats.builder()
                            .raceId(r.getId())
                            .raceName(r.getRaceName())
                            .status(r.getStatus().name())
                            .startTime(r.getStartTime())
                            .totalHorses(totalHorsesInRace)
                            .totalBets(totalBetsInRace)
                            .prizePool(r.getTotalprizepool())
                            .build();
                })
                .collect(Collectors.toList());
        return AdminStatsResponse.builder()
                .adminWalletBalance(adminBalance)
                .totalDepositApproved(totalDeposit)
                .totalWithdrawApproved(totalWithdraw)
                .totalEntryFeeCollected(totalEntryFee)
                .totalPrizePoolFunded(totalPrizeFunded)
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
                .totalPendingReports(pendingReports)
                .totalPendingDeposits(pendingDeposits)
                .totalPendingWithdraws(pendingWithdraws)
                .recentRaces(recentRaces)
                .build();
    }


    private ReportResponse mapToReportResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .reporterId(r.getReporter().getId())
                .reporterName(r.getReporter().getFullName())
                .targetType(r.getTargetType())
                .targetId(r.getTargetId())
                .targetName(r.getTargetName())
                .reason(r.getReason())
                .detail(r.getDetail())
                .status(r.getStatus())
                .adminNote(r.getAdminNote())
                .createdAt(r.getCreatedAt())
                .reviewedAt(r.getReviewedAt())
                .build();
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
