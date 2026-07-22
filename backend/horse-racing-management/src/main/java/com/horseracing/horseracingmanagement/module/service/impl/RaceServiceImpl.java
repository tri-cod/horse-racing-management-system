package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import jakarta.transaction.Transactional;
import com.horseracing.horseracingmanagement.module.service.RaceService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RaceServiceImpl implements RaceService {

    private final RaceRepository raceRepository;
    private final RaceRefereeRepository raceRefereeRepository;
    private final WebSocketNotificationService wsService;
    private final BetItemRepository betItemRepository;
    private final BetRepository betRepository;
    private final RaceResultRepository raceResultRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceHorseService raceHorseService;
    private final PenaltyRepository penaltyRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    // Admin start race → đóng bet
    public RaceResponse startRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // ← fix: phải là CLOSED_REGISTRATION mới được start
        if (race.getStatus() != RaceStatus.OPEN_BETTING) {
            throw new RuntimeException("Race must be OPEN_BETTING to start");
        }

        // ← Pre-race inspection gate: the assigned referee must run the inspection and have
        // it come back clean before anyone (admin included) can start the race.
        if (race.getRaceInspectedAt() == null) {
            throw new RuntimeException("Race has not been inspected yet. The assigned referee must run the pre-race inspection first.");
        }

        List<String> issues = raceHorseService.getPreRaceIssues(raceId);
        if (!issues.isEmpty()) {
            throw new RuntimeException("Cannot start race — inspection found issues: " + String.join("; ", issues));
        }

        race.setStatus(RaceStatus.ONGOING);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("ONGOING")
                .message("Race has started! Betting is now closed.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    // Referee finish race → push kết quả
    //
    // ← LƯU Ý (chưa chắc là bug, cần team xác nhận lại ý đồ thiết kế): method này
    // CHỦ Ý không đổi race.status trong DB — status thật chỉ chuyển sang FINISHED
    // trong RaceResultServiceImpl.setRaceResult() (vì method đó yêu cầu status đang
    // là ONGOING mới cho nhập kết quả). Method này chỉ đóng vai trò "ngựa đã về đích,
    // đang chờ nhập kết quả chính thức" — nếu đổi status ở đây thành FINISHED luôn thì
    // setRaceResult() sẽ bị chặn ngay bước validate (status != ONGOING).
    // Trước đây WS message gửi status="FINISHED" dù DB vẫn là ONGOING — sửa lại nhãn
    // cho khớp thực tế, tránh FE hiểu nhầm là race đã có kết quả.
    public RaceResponse finishRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Race must be ONGOING to finish");
        }


        // ← Push WebSocket → FE hiện "đã về đích, đang chờ kết quả" (KHÔNG phải FINISHED
        // thật sự — status DB vẫn là ONGOING cho tới khi referee submit setRaceResult())
        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("AWAITING_RESULTS")
                .message("Race has crossed the finish line! Results are being calculated.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    @Override
    @Transactional
    public RaceResponse createRace(CreateRaceRequest request) {

        if (request.getTotalprizepool() != null && request.getTotalprizepool() > 0) {
            User adminUser = userRepository.findFirstByRole_Rolename(RoleName.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            Wallet adminWallet = walletRepository.findByUser_Id(adminUser.getId())
                    .orElseThrow(() -> new RuntimeException("Admin wallet not found"));

            BigDecimal prizePool = BigDecimal.valueOf(request.getTotalprizepool());

            if (adminWallet.getBalance().compareTo(prizePool) < 0) {
                throw new RuntimeException(
                        "Admin wallet has insufficient balance to fund this prize pool. " +
                                "Required: " + prizePool + ", Available: " + adminWallet.getBalance());
            }

            adminWallet.setBalance(adminWallet.getBalance().subtract(prizePool));
            walletRepository.save(adminWallet);
        }

        // tìm referee nếu admin có set
        RaceReferee referee = null;
        if (request.getRefereeId() != null) {
            referee = raceRefereeRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Referee not found"));
        }




        validateRegistrationDates(request.getRegistrationOpenDate(),
                request.getRegistrationDeadline(), request.getStartTime());

        RaceStatus initialStatus = request.getStatus() != null
                ? request.getStatus()
                : determineInitialStatus(request.getRegistrationOpenDate());

        // ← raceClass mang theo mức thưởng mặc định (VD: MAIDEN = 0-0, CLASS_3 = 0-150tr) —
        // chỉ áp dụng mặc định khi admin không tự nhập minEarnings/maxEarnings riêng.
        Long minEarnings = request.getMinEarnings();
        Long maxEarnings = request.getMaxEarnings();
        if (request.getRaceClass() != null) {
            if (minEarnings == null) minEarnings = request.getRaceClass().getDefaultMinEarnings();
            if (maxEarnings == null) maxEarnings = request.getRaceClass().getDefaultMaxEarnings();
        }

        // ← distance (chuỗi tự do, VD "1600m") vẫn được nhiều màn hình cũ dùng để hiển thị —
        // nếu admin chỉ nhập distanceMeters (số thực) thì tự suy ra chuỗi hiển thị tương ứng.
        String distance = request.getDistance();
        if ((distance == null || distance.isBlank()) && request.getDistanceMeters() != null) {
            distance = formatDistanceMeters(request.getDistanceMeters());
        }

        Race race = Race.builder()
                .raceName(request.getRaceName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .trackName(request.getTrackName())
                .trackCondition(request.getTrackCondition())
                .surfaceType(request.getSurfaceType())
                .totalprizepool(request.getTotalprizepool())
                .distance(distance)
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .bannerImageurl(request.getBannerImageurl())
                .registrationOpenDate(request.getRegistrationOpenDate())
                .registrationDeadline(request.getRegistrationDeadline())
                .status(initialStatus)
                .referee(referee)
                .minAge(request.getMinAge())
                .maxAge(request.getMaxAge())
                .genderRestriction(request.getGenderRestriction())
                .raceClass(request.getRaceClass())
                .minEarnings(minEarnings)
                .maxEarnings(maxEarnings)
                .distanceMeters(request.getDistanceMeters())
                .minWeight(request.getMinWeight())
                .build();

        return mapToResponse(raceRepository.save(race));
    }

    private String formatDistanceMeters(Double meters) {
        // Bỏ phần thập phân khi nó tròn số (1600.0 → "1600m"), giữ lại khi có số lẻ (1600.5 → "1600.5m")
        if (meters == Math.floor(meters)) {
            return meters.longValue() + "m";
        }
        return meters + "m";
    }

    private RaceStatus determineInitialStatus(Instant registrationOpenDate) {
        if (registrationOpenDate != null && registrationOpenDate.isAfter(Instant.now())) {
            return RaceStatus.UPCOMING;
        }
        return RaceStatus.OPEN_REGISTRATION;
    }

    private void validateRegistrationDates(Instant registrationOpenDate, Instant registrationDeadline, Instant startTime) {
        if (registrationOpenDate != null && registrationDeadline != null
                && !registrationOpenDate.isBefore(registrationDeadline)) {
            throw new RuntimeException("Registration open date must be before registration deadline");
        }
        if (registrationDeadline != null && startTime != null
                && registrationDeadline.isAfter(startTime)) {
            throw new RuntimeException("Registration deadline must be before start time");
        }
        if (registrationOpenDate != null && startTime != null
                && !registrationOpenDate.isBefore(startTime)) {
            throw new RuntimeException("Registration open date must be before start time");
        }
    }

    @Override
    @Transactional
    public RaceResponse closeRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.UPCOMING && race.getStatus() != RaceStatus.OPEN_REGISTRATION) {
            throw new RuntimeException("Race must be UPCOMING or OPEN_REGISTRATION to close registration");
        }

        race.setStatus(RaceStatus.CLOSED_REGISTRATION);
        raceRepository.save(race);

        // ← Xóa các pending chưa hoàn tất + hoàn phí
        raceHorseService.cleanupPendingOnClose(raceId);

        // ← Chuyển sang SETTING_ODDS thay vì CLOSED_REGISTRATION
        race.setStatus(RaceStatus.SETTING_ODDS);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("SETTING_ODDS")
                .message("Registration closed. Odds can now be set.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    @Override
    public RaceResponse openBetting(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.SETTING_ODDS) {
            throw new RuntimeException("Race must be SETTING_ODDS to open betting");
        }

        // ← Check tất cả horse đã có odds chưa
        List<RaceHorse> approvedHorses = raceHorseRepository
                .findByRace_IdAndStatus(raceId, RaceHorseStatus.APPROVED);

        List<String> missingOdds = approvedHorses.stream()
                .filter(rh -> rh.getOdds() == null)
                .map(rh -> rh.getHorse().getHorseName())
                .collect(Collectors.toList());

        if (!missingOdds.isEmpty()) {
            throw new RuntimeException("Missing odds for horses: " + missingOdds);
        }

        race.setStatus(RaceStatus.OPEN_BETTING);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("OPEN_BETTING")
                .message("Betting is now open!")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    @Override
    public RaceResponse getRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));
        return mapToResponse(race);
    }

    @Override
    public Page<RaceResponse> getRaceList(String status, Pageable pageable) {
        if (status != null) {
            RaceStatus raceStatus = RaceStatus.valueOf(status.toUpperCase());  // ← convert đúng
            return raceRepository.findByStatus(raceStatus, pageable).map(this::mapToResponse);
        }
        return raceRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteRace(Long raceId) {
        if (!raceRepository.existsById(raceId)) {
            throw new RuntimeException("Race not found");
        }

        penaltyRepository.deleteByRaceHorse_Race_Id(raceId);
        betItemRepository.deleteByBet_Race_Id(raceId);   // bet_items → bet → race
        betRepository.deleteByRace_Id(raceId);            // bet → race
        raceResultRepository.deleteByRace_Id(raceId);     // race_result → race_horse + race
        raceHorseRepository.deleteByRace_Id(raceId);      // race_horse → race
        raceRepository.deleteById(raceId);
    }

    @Override
    public RaceResponse updateRace(Long raceId, CreateRaceRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        validateRaceTimeUpdate(race, request);
        if (request.getRefereeId() != null) {
            RaceReferee referee = raceRefereeRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Referee not found"));
            race.setReferee(referee);
        }

        race.setRaceName(request.getRaceName());
        race.setStartTime(request.getStartTime());
        race.setEndTime(request.getEndTime());
        race.setTrackName(request.getTrackName());
        race.setTrackCondition(request.getTrackCondition());
        race.setSurfaceType(request.getSurfaceType());
        race.setTotalprizepool(request.getTotalprizepool());

        String distance = request.getDistance();
        if ((distance == null || distance.isBlank()) && request.getDistanceMeters() != null) {
            distance = formatDistanceMeters(request.getDistanceMeters());
        }
        race.setDistance(distance);
        race.setDistanceMeters(request.getDistanceMeters());

        race.setRegistrationOpenDate(request.getRegistrationOpenDate());
        race.setRegistrationDeadline(request.getRegistrationDeadline());
        race.setLocation(request.getLocation());
        race.setCapacity(request.getCapacity());
        race.setBannerImageurl(request.getBannerImageurl());

        race.setMinAge(request.getMinAge());
        race.setMaxAge(request.getMaxAge());
        race.setGenderRestriction(request.getGenderRestriction());
        race.setMinWeight(request.getMinWeight());

        race.setRaceClass(request.getRaceClass());
        Long minEarnings = request.getMinEarnings();
        Long maxEarnings = request.getMaxEarnings();
        if (request.getRaceClass() != null) {
            if (minEarnings == null) minEarnings = request.getRaceClass().getDefaultMinEarnings();
            if (maxEarnings == null) maxEarnings = request.getRaceClass().getDefaultMaxEarnings();
        }
        race.setMinEarnings(minEarnings);
        race.setMaxEarnings(maxEarnings);

        Race saved = raceRepository.save(race);
        return mapToResponse(saved);
    }

    private void validateRaceTimeUpdate(Race race, CreateRaceRequest request) {
        Instant now = Instant.now();

        // Không cho sửa khi race đã ONGOING hoặc FINISHED
        if (race.getStatus() == RaceStatus.ONGOING ||
                race.getStatus() == RaceStatus.FINISHED) {
            throw new RuntimeException("Cannot edit a race that is ongoing or finished");
        }


        if (request.getStartTime() != null &&
                request.getStartTime().isBefore(now)) {
            throw new RuntimeException("Start time must be in the future");
        }


        if (request.getRegistrationDeadline() != null &&
                request.getStartTime() != null &&
                request.getRegistrationDeadline().isAfter(request.getStartTime())) {
            throw new RuntimeException("Registration deadline must be before start time");
        }


        validateRegistrationDates(request.getRegistrationOpenDate(),
                request.getRegistrationDeadline(), request.getStartTime());

        if (request.getEndTime() != null &&
                request.getStartTime() != null &&
                request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }


        if (race.getStatus() == RaceStatus.CLOSED_REGISTRATION &&
                request.getRegistrationDeadline() != null &&
                request.getRegistrationDeadline().isAfter(now)) {
            throw new RuntimeException(
                    "Race is already CLOSED_REGISTRATION. To reopen, use the reopen endpoint instead.");
        }
    }
    @Override
    public RaceResponse reopenRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.CLOSED_REGISTRATION && race.getStatus() != RaceStatus.SETTING_ODDS) {
            throw new RuntimeException("Only a race in CLOSED_REGISTRATION or SETTING_ODDS can be reopened");
        }

        race.setStatus(RaceStatus.OPEN_REGISTRATION);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("OPEN_REGISTRATION")
                .message("Registration reopened!")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }



    private RaceResponse mapToResponse(Race race) {
        String refereeName = null;
        Long refereeId = null;

        if (race.getReferee() != null) {
            refereeId = race.getReferee().getId();
            User refereeUser = race.getReferee().getUser();
            refereeName = refereeUser.getFullName() != null
                    ? refereeUser.getFullName()
                    : refereeUser.getUsername();
        }

        return RaceResponse.builder()
                .id(race.getId())
                .raceName(race.getRaceName())
                .startTime(race.getStartTime())
                .endTime(race.getEndTime())
                .trackName(race.getTrackName())
                .trackCondition(race.getTrackCondition())
                .surfaceType(race.getSurfaceType())
                .totalprizepool(race.getTotalprizepool())
                .distance(race.getDistance())
                .location(race.getLocation())
                .capacity(race.getCapacity())
                .bannerImageurl(race.getBannerImageurl())
                .status(race.getStatus() != null ? race.getStatus().name() : null)
                .registrationOpenDate(race.getRegistrationOpenDate())
                .registrationDeadline(race.getRegistrationDeadline())
                .createdAt(race.getCreatedAt())
                .updatedAt(race.getUpdatedAt())
                .raceInspectedAt(race.getRaceInspectedAt())
                .refereeId(refereeId)
                .refereeName(refereeName)
                .minAge(race.getMinAge())
                .maxAge(race.getMaxAge())
                .genderRestriction(race.getGenderRestriction())
                .raceClass(race.getRaceClass() != null ? race.getRaceClass().name() : null)
                .minEarnings(race.getMinEarnings())
                .maxEarnings(race.getMaxEarnings())
                .distanceMeters(race.getDistanceMeters())
                .minWeight(race.getMinWeight())
                .build();
    }
}