package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.*;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RefereeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefereeServiceImpl implements RefereeService {

    private final RaceRefereeRepository raceRefereeRepository;
    private final RaceRepository raceRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final PenaltyRepository penaltyRepository;
    private final HorseRepository horseRepository;
    private final WalletRepository walletRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final NotificationService notificationService;

    @Override
    public RefereeProfileResponse completeProfile(CompleteRefereeProfileRequest request, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee profile not found"));

        if (request.getExperienceYears() != null) referee.setExperienceyears(request.getExperienceYears());
        if (request.getDescription() != null) referee.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) referee.setAvatarUrl(request.getAvatarUrl());
        if (request.getCoverImageUrl() != null) referee.setCoverImageUrl(request.getCoverImageUrl());

        return mapToProfileResponse(raceRefereeRepository.save(referee));
    }

    @Override
    public RefereeProfileResponse getMyProfile(Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee profile not found"));
        return mapToProfileResponse(referee);
    }

    @Override
    public RefereeProfileResponse getRefereeProfile(Long refereeId) {
        RaceReferee referee = raceRefereeRepository.findById(refereeId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));
        return mapToProfileResponse(referee);
    }

    // RefereeServiceImpl — implement
    @Override
    public List<RefereeProfileResponse> getAllReferees() {
        return raceRefereeRepository.findAll()
                .stream()
                .filter(r -> r.getUser() != null && r.getUser().getStatus() != UserStatus.BANNED)
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    // Race sắp tới mà referee này được assign
    @Override
    public List<RefereeRaceResponse> getMyUpcomingRaces(Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        return raceRepository.findByReferee_Id(referee.getId()).stream()
                .filter(r -> r.getStatus() != RaceStatus.FINISHED
                        && r.getStatus() != RaceStatus.CANCELLED
                        && r.getStatus() != RaceStatus.ONGOING)
                .map(r -> mapToRefereeRaceResponse(r, referee.getId()))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }

    // Race đang diễn ra
    @Override
    public List<RefereeRaceResponse> getMyCurrentRaces(Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        return raceRepository.findByReferee_Id(referee.getId()).stream()
                .filter(r -> r.getStatus() == RaceStatus.ONGOING)
                .map(r -> mapToRefereeRaceResponse(r, referee.getId()))
                .collect(Collectors.toList());
    }

    // Lịch sử race đã làm trọng tài
    @Override
    public List<RefereeRaceResponse> getMyRaceHistory(Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        return raceRepository.findByReferee_Id(referee.getId()).stream()
                .filter(r -> r.getStatus() == RaceStatus.FINISHED)
                .map(r -> mapToRefereeRaceResponse(r, referee.getId()))
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    // ============ PENALTY ============
    @Override
    @Transactional
    public PenaltyResponse issuePenalty(PenaltyRequest request, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        // Check referee có phụ trách race này không
        Race race = raceHorse.getRace();
        if (race.getReferee() == null || !race.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the referee of this race");
        }

        // Check race đang ONGOING
        if (race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Can only issue penalty during ONGOING race");
        }

        Penalty penalty = Penalty.builder()
                .raceHorse(raceHorse)
                .referee(referee)
                .reason(request.getReason())
                .penaltyType(request.getPenaltyType())
                .amount(request.getAmount())
                .timePenaltySeconds(request.getTimePenaltySeconds())
                .isDisqualified(request.getPenaltyType().equals("DISQUALIFY"))
                .build();

        Penalty saved = penaltyRepository.save(penalty);

        // Nếu DISQUALIFY → đổi status RaceHorse
        if ("DISQUALIFY".equals(request.getPenaltyType())) {
            raceHorse.setStatus(RaceHorseStatus.DISQUALIFIED);  // ← thêm vào enum
            raceHorseRepository.save(raceHorse);

            // Đổi status horse về ACTIVE (không còn racing nữa)
            Horse horse = raceHorse.getHorse();
            horse.setStatus(HorseStatus.ACTIVE);
            horseRepository.save(horse);
        }

        // Notify HorseOwner
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElse(null);
        if (owner != null) {
            String message = switch (request.getPenaltyType()) {
                case "DISQUALIFY" -> String.format(
                        "⛔ Your horse '%s' has been DISQUALIFIED from race '%s'. Reason: %s",
                        raceHorse.getHorse().getHorseName(), race.getRaceName(), request.getReason());
                case "FINE" -> String.format(
                        "💸 Your horse '%s' received a FINE of %s in race '%s'. Reason: %s",
                        raceHorse.getHorse().getHorseName(), request.getAmount(),
                        race.getRaceName(), request.getReason());
                case "TIME_PENALTY" -> String.format(
                        "⏱️ Your horse '%s' received a TIME PENALTY of %s seconds in race '%s'. Reason: %s",
                        raceHorse.getHorse().getHorseName(), request.getTimePenaltySeconds(),
                        race.getRaceName(), request.getReason());
                default -> String.format(
                        "⚠️ Your horse '%s' received a WARNING in race '%s'. Reason: %s",
                        raceHorse.getHorse().getHorseName(), race.getRaceName(), request.getReason());
            };

            notificationService.sendToUser(
                    owner.getUser().getId(),
                    "🚨 Penalty Issued",
                    message,
                    NotificationType.RACE_RESULT_PUBLISHED,
                    saved.getId()
            );
        }

        return mapToPenaltyResponse(saved);
    }

    @Override
    public List<PenaltyResponse> getPenaltiesByRace(Long raceId) {
        return penaltyRepository.findByRaceHorse_Race_Id(raceId)
                .stream()
                .map(this::mapToPenaltyResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PenaltyResponse> getMyPenaltyHistory(Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        return penaltyRepository.findByReferee_Id(referee.getId())
                .stream()
                .map(this::mapToPenaltyResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelPenalty(Long penaltyId, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Penalty penalty = penaltyRepository.findById(penaltyId)
                .orElseThrow(() -> new RuntimeException("Penalty not found"));

        // Chỉ referee đã phạt mới được hủy
        if (!penalty.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You did not issue this penalty");
        }

        // Nếu là DISQUALIFY → khôi phục lại status
        if (Boolean.TRUE.equals(penalty.getIsDisqualified())) {
            RaceHorse raceHorse = penalty.getRaceHorse();
            raceHorse.setStatus(RaceHorseStatus.APPROVED);
            raceHorseRepository.save(raceHorse);

            Horse horse = raceHorse.getHorse();
            horse.setStatus(HorseStatus.RACING);
            horseRepository.save(horse);
        }

        penaltyRepository.deleteById(penaltyId);
    }


    // Implement
    @Override
    public PreRaceInspectionResponse inspectRace(Long raceId, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // Check referee có phụ trách race này không
        if (race.getReferee() == null || !race.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the referee of this race");
        }

        // Inspection is only for the pre-race check — once the race is ONGOING it's too late to matter.
        if (race.getStatus() != RaceStatus.OPEN_BETTING) {
            throw new RuntimeException("Race must be OPEN_BETTING to inspect");
        }

        List<RaceHorse> approvedHorses = raceHorseRepository
                .findByRace_IdAndStatus(raceId, RaceHorseStatus.APPROVED);

        List<String> globalIssues = new ArrayList<>();
        List<HorseInspectionItem> items = new ArrayList<>();

        for (RaceHorse rh : approvedHorses) {
            List<String> warnings = new ArrayList<>();

            // ← Check 1: Horse có status ACTIVE/RACING không (không phải INJURED/RETIRED)
            if (rh.getHorse().getStatus() == HorseStatus.INACTIVE ||
                    rh.getHorse().getStatus() == HorseStatus.RETIRED) {
                warnings.add("⚠️ Horse is " + rh.getHorse().getStatus() + " — not fit to race");
                globalIssues.add("Horse '" + rh.getHorse().getHorseName() + "' is not fit to race");
            }

            // ← Check 2: Jockey có tồn tại không
            if (rh.getJockey() == null) {
                warnings.add("❌ No jockey assigned");
                globalIssues.add("Horse '" + rh.getHorse().getHorseName() + "' has no jockey");
            }

            // ← Check 3: Jockey có status ACTIVE không
            if (rh.getJockey() != null &&
                    !"Active".equalsIgnoreCase(rh.getJockey().getStatus())) {
                warnings.add("⚠️ Jockey is " + rh.getJockey().getStatus());
                globalIssues.add("Jockey '" + rh.getJockey().getUser().getFullName()
                        + "' is not active");
            }

            // ← Check 4: Odds đã set chưa
            if (rh.getOdds() == null) {
                warnings.add("⚠️ Odds not set");
                globalIssues.add("Horse '" + rh.getHorse().getHorseName() + "' has no odds");
            }

            // ← Check 5: Jockey có đang cưỡi 2 ngựa cùng race không
            if (rh.getJockey() != null) {
                long jockeyCount = approvedHorses.stream()
                        .filter(other -> other.getJockey() != null
                                && other.getJockey().getId().equals(rh.getJockey().getId())
                                && !other.getId().equals(rh.getId()))
                        .count();
                if (jockeyCount > 0) {
                    warnings.add("❌ Jockey assigned to multiple horses in same race!");
                    globalIssues.add("Jockey '" + rh.getJockey().getUser().getFullName()
                            + "' is assigned to multiple horses");
                }
            }

            // ← Manual sign-off: every approved horse must end up either ticked OK by the
            // referee or have an issue reported against it — one of the two, not neither.
            boolean verified = Boolean.TRUE.equals(rh.getVerifiedOk());
            boolean reported = !penaltyRepository.findByRaceHorse_Id(rh.getId()).isEmpty();
            if (!verified && !reported) {
                warnings.add("❌ Not yet checked — tick OK or report an issue");
                globalIssues.add("Horse '" + rh.getHorse().getHorseName() + "' has not been checked by the referee yet");
            }

            items.add(HorseInspectionItem.builder()
                    .raceHorseId(rh.getId())
                    .horseId(rh.getHorse().getId())
                    .horseName(rh.getHorse().getHorseName())
                    .horseStatus(rh.getHorse().getStatus().name())
                    .horseAvatarUrl(rh.getHorse().getAvatarUrl())
                    .breed(rh.getHorse().getBreed())
                    .age(rh.getHorse().getAge())
                    .gender(rh.getHorse().getGender())
                    .weight(rh.getHorse().getWeight())
                    .speedRating(rh.getHorse().getSpeedRating())
                    .historyRank(rh.getHorse().getHistoryRank())
                    .jockeyId(rh.getJockey() != null ? rh.getJockey().getId() : null)
                    .jockeyName(rh.getJockey() != null
                            ? rh.getJockey().getUser().getFullName() : null)
                    .jockeyAvatarUrl(rh.getJockey() != null ? rh.getJockey().getAvatarUrl() : null)
                    .jockeyStatus(rh.getJockey() != null ? rh.getJockey().getStatus() : null)
                    .odds(rh.getOdds())
                    .warnings(warnings)
                    .verified(verified)
                    .reported(reported)
                    .build());
        }

        // ← Stamp the race as inspected only when it comes back clean; startRace() requires
        // this. A dirty result clears any earlier stamp so a stale pass can't be relied on.
        race.setRaceInspectedAt(globalIssues.isEmpty() ? Instant.now() : null);
        raceRepository.save(race);

        return PreRaceInspectionResponse.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .horses(items)
                .issues(globalIssues)
                .readyToRace(globalIssues.isEmpty())
                .build();
    }

    @Override
    @Transactional
    public void verifyHorse(VerifyHorseRequest request, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        Race race = raceHorse.getRace();
        if (race.getReferee() == null || !race.getReferee().getId().equals(referee.getId())) {
            throw new RuntimeException("You are not the referee of this race");
        }

        if (race.getStatus() != RaceStatus.OPEN_BETTING) {
            throw new RuntimeException("Race must be OPEN_BETTING to verify horses");
        }

        raceHorse.setVerifiedOk(request.getVerified());
        raceHorseRepository.save(raceHorse);
    }

    @Override
    @Transactional
    public void reportInspectionIssue(InspectionIssueRequest request, Long userId) {
        RaceReferee referee = raceRefereeRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Referee not found"));

        RaceHorse raceHorse = raceHorseRepository.findById(request.getRaceHorseId())
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));

        // Nếu WRONG_HORSE hoặc HORSE_UNFIT → disqualify ngay
        if ("WRONG_HORSE".equals(request.getIssueType()) ||
                "HORSE_UNFIT".equals(request.getIssueType())) {

            Penalty penalty = Penalty.builder()
                    .raceHorse(raceHorse)
                    .referee(referee)
                    .reason(request.getDescription())
                    .penaltyType("DISQUALIFY")
                    .isDisqualified(true)
                    .build();
            penaltyRepository.save(penalty);

            raceHorse.setStatus(RaceHorseStatus.DISQUALIFIED);
            raceHorseRepository.save(raceHorse);

            raceHorse.getHorse().setStatus(HorseStatus.ACTIVE);
            horseRepository.save(raceHorse.getHorse());
        } else {
            // WRONG_JOCKEY, EQUIPMENT_ISSUE → issue warning penalty
            Penalty penalty = Penalty.builder()
                    .raceHorse(raceHorse)
                    .referee(referee)
                    .reason(request.getDescription())
                    .penaltyType("WARNING")
                    .isDisqualified(false)
                    .build();
            penaltyRepository.save(penalty);
        }

        // Notify HorseOwner
        HorseOwner owner = horseOwnerRepository.findById(raceHorse.getHorse().getOwnerId())
                .orElse(null);
        if (owner != null) {
            notificationService.sendToUser(
                    owner.getUser().getId(),
                    "🚨 Inspection Issue",
                    String.format("[%s] %s — Horse: %s",
                            request.getIssueType(),
                            request.getDescription(),
                            raceHorse.getHorse().getHorseName()),
                    NotificationType.RACE_RESULT_PUBLISHED,
                    raceHorse.getId()
            );
        }
    }

    // ============ mappers ============
    private RefereeProfileResponse mapToProfileResponse(RaceReferee referee) {
        long totalRaces = raceRepository.findByReferee_Id(referee.getId()).size();
        long totalPenalties = penaltyRepository.countByReferee_Id(referee.getId());

        return RefereeProfileResponse.builder()
                .id(referee.getId())
                .userId(referee.getUser().getId())
                .name(referee.getUser().getFullName() != null
                        ? referee.getUser().getFullName()
                        : referee.getUser().getUsername())
                .avatarUrl(referee.getAvatarUrl())
                .coverImageUrl(referee.getCoverImageUrl())
                .experienceYears(referee.getExperienceyears())
                .description(referee.getDescription())
                .status(referee.getStatus())
                .totalRacesRefereed(totalRaces)
                .totalPenaltiesGiven(totalPenalties)
                .build();
    }

    private RefereeRaceResponse mapToRefereeRaceResponse(Race race, Long refereeId) {
        long totalHorses = raceHorseRepository.countByRace_Id(race.getId());
        long totalPenalties = penaltyRepository
                .findByRaceHorse_Race_IdAndReferee_Id(race.getId(), refereeId).size();

        return RefereeRaceResponse.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .raceStatus(race.getStatus() != null ? race.getStatus().name() : null)
                .location(race.getLocation())
                .startTime(race.getStartTime())
                .totalHorses(totalHorses)
                .totalPenalties(totalPenalties)
                .build();
    }

    private PenaltyResponse mapToPenaltyResponse(Penalty penalty) {
        return PenaltyResponse.builder()
                .id(penalty.getId())
                .raceHorseId(penalty.getRaceHorse().getId())
                .horseName(penalty.getRaceHorse().getHorse().getHorseName())
                .refereeId(penalty.getReferee().getId())
                .refereeName(penalty.getReferee().getUser().getFullName())
                .reason(penalty.getReason())
                .penaltyType(penalty.getPenaltyType())
                .amount(penalty.getAmount())
                .timePenaltySeconds(penalty.getTimePenaltySeconds())
                .isDisqualified(penalty.getIsDisqualified())
                .createdAt(penalty.getCreatedAt())
                .build();
    }
}