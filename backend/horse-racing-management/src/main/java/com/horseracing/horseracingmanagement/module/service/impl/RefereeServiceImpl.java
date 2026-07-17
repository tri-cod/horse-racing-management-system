package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.HorseStatus;
import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RefereeDto.*;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.RefereeService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
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