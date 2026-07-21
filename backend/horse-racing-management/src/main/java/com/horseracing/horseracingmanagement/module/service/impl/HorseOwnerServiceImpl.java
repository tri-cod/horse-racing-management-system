package com.horseracing.horseracingmanagement.module.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.horseracing.horseracingmanagement.common.constant.RaceHorseStatus;
import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseRaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.*;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.horseracing.horseracingmanagement.common.exception.AppException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class HorseOwnerServiceImpl implements HorseOwnerService {


    private final HorseRepository horseRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final TrainerRepository trainerRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceRepository raceRepository;
    private final RaceResultRepository raceResultRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();



    @Override
    public SignHorseResponse signHorse(SignHorseRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));


        String raceHistoryJson = null;
        if (request.getRaceHistory() != null && !request.getRaceHistory().isEmpty()) {
            try {
                raceHistoryJson = objectMapper.writeValueAsString(request.getRaceHistory());
            } catch (Exception e) {
                raceHistoryJson = "[]";
            }
        }

        Horse horse = Horse.builder()
                .ownerId(owner.getId())
                .horseName(request.getHorseName())
                .breed(request.getBreed())
                .age(request.getAge())
                .gender(request.getGender())
                .speedRating(request.getSpeedRating())
                .description(request.getDescription())
                .raceHistory(raceHistoryJson)
                .avatarUrl(request.getAvatar_url())
                .weight(request.getWeight())
                .status(request.getStatus())
                .trainerId(null)
                .build();

        Horse saved = horseRepository.save(horse);
        return mapToResponse(saved, owner.getName(), null, null);
    }

    @Override
    public SignHorseResponse assignTrainer(Long horseId, Long trainerId, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        // Check trainer có tồn tại không
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        horse.setTrainerId(trainerId);
        Horse saved = horseRepository.save(horse);
        return mapToResponse(saved, owner.getName(), trainerId, trainer.getName());
    }

    @Override
    public SignHorseResponse getHorse(Long horseId) {
        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        String ownerName = horseOwnerRepository.findById(horse.getOwnerId())
                .map(HorseOwner::getName).orElse(null);

        String trainerName = horse.getTrainerId() != null
                ? trainerRepository.findById(horse.getTrainerId())
                .map(Trainer::getName).orElse(null)
                : null;

        return mapToResponse(horse, ownerName, horse.getTrainerId(), trainerName);
    }

    @Override
    public List<SignHorseResponse> getHorseList(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        List<Horse> horses = horseRepository.findByOwnerId(owner.getId());

        return horses.stream()
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(), horse.getTrainerId(), trainerName);
                })
                .collect(Collectors.toList());
    }



    @Override
    public List<SignHorseResponse> getAvailableHorseList(Long userId, Long raceId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        List<Horse> ownerHorses = horseRepository.findByOwnerId(owner.getId());

        // ← Chặn theo ngày thay vì chặn toàn bộ
        List<Long> horsesOnSameDay = race.getStartTime() != null
                ? raceHorseRepository.findHorseIdsOnSameDay(raceId, race.getStartTime())
                : List.of();

        // ← Chặn horse đã đăng ký chính race này rồi
        List<Long> horsesInThisRace = raceHorseRepository.findHorseIdsByRaceId(raceId);

        return ownerHorses.stream()
                .filter(horse -> !horsesOnSameDay.contains(horse.getId())
                        && !horsesInThisRace.contains(horse.getId()))
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(),
                            horse.getTrainerId(), trainerName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<SignHorseResponse> getHorseListWithFilter(String keyword, String status, Pageable pageable) {
        return horseRepository.findWithFilters(keyword, status, pageable)
                .map(horse -> {
                    String ownerName = horseOwnerRepository.findById(horse.getOwnerId())
                            .map(HorseOwner::getName).orElse(null);
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, ownerName, horse.getTrainerId(), trainerName);
                });
    }



    // Toàn bộ lịch sử race mà horse này đã/đang tham gia
    @Override
    public List<HorseRaceHistoryResponse> getHorseRaceHistory(Long horseId) {
        List<RaceHorse> raceHorses = raceHorseRepository.findByHorse_Id(horseId);

        return raceHorses.stream()
                .map(rh -> {
                    Long rank = raceResultRepository.findByRaceHorse_Id(rh.getId())
                            .map(RaceResult::getRank)
                            .orElse(null);

                    return HorseRaceHistoryResponse.builder()
                            .raceHorseId(rh.getId())
                            .raceId(rh.getRace().getId())
                            .raceName(rh.getRace().getRaceName())
                            .raceStatus(rh.getRace().getStatus().name())
                            .startTime(rh.getRace().getStartTime())
                            .registrationStatus(rh.getStatus().name())
                            .jockeyId(rh.getJockey() != null ? rh.getJockey().getId() : null)
                            .jockeyName(rh.getJockey() != null
                                    ? rh.getJockey().getUser().getFullName() : null)
                            .rank(rank)
                            .build();
                })
                .collect(Collectors.toList());
    }

    // Race hiện tại horse đang tham gia (chưa FINISHED) — để biết horse có đang "bận" không
    @Override
    public HorseRaceHistoryResponse getCurrentRace(Long horseId) {
        List<RaceHorse> raceHorses = raceHorseRepository.findByHorse_Id(horseId);

        return raceHorses.stream()
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED)
                .findFirst()
                .map(rh -> HorseRaceHistoryResponse.builder()
                        .raceHorseId(rh.getId())
                        .raceId(rh.getRace().getId())
                        .raceName(rh.getRace().getRaceName())
                        .raceStatus(rh.getRace().getStatus().name())
                        .startTime(rh.getRace().getStartTime())
                        .registrationStatus(rh.getStatus().name())
                        .jockeyId(rh.getJockey() != null ? rh.getJockey().getId() : null)
                        .jockeyName(rh.getJockey() != null
                                ? rh.getJockey().getUser().getFullName() : null)
                        .rank(null)
                        .build())
                .orElse(null);
    }

    // Toàn bộ horse trong hệ thống + race hiện tại (nếu có)
    @Override
    public List<HorseCurrentStatusResponse> getAllHorsesWithCurrentRace() {
        List<Horse> allHorses = horseRepository.findAll();

        return allHorses.stream()
                .map(this::mapToCurrentStatusResponse)
                .collect(Collectors.toList());
    }

    // Chỉ những horse đang trong 1 race cụ thể (dùng để Spectator xem trước khi bet)
    @Override
    public List<HorseCurrentStatusResponse> getHorsesByRaceId(Long raceId) {
        List<RaceHorse> raceHorses = raceHorseRepository.findByRace_Id(raceId);

        return raceHorses.stream()
                .map(rh -> HorseCurrentStatusResponse.builder()
                        .horseId(rh.getHorse().getId())
                        .horseName(rh.getHorse().getHorseName())
                        .breed(rh.getHorse().getBreed())
                        .avatarUrl(rh.getHorse().getAvatarUrl())
                        .status(String.valueOf(rh.getHorse().getStatus()))
                        .currentRaceId(rh.getRace().getId())
                        .currentRaceName(rh.getRace().getRaceName())
                        .currentRaceStatus(rh.getRace().getStatus().name())
                        .registrationStatus(rh.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }


    @Override
    public List<RaceParticipationResponse> getOwnerRaceHistoryById(Long ownerId) {
        HorseOwner owner = horseOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());
        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(this::buildOwnerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceParticipationResponse> getOwnerUpcomingRacesById(Long ownerId) {
        HorseOwner owner = horseOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());
        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED
                        && rh.getStatus().equals(RaceHorseStatus.APPROVED))
                .map(this::buildOwnerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }

    @Override
    public List<SignHorseResponse> getHorsesByOwnerId(Long ownerId) {
        HorseOwner owner = horseOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        return horseRepository.findByOwnerId(owner.getId())
                .stream()
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(),
                            horse.getTrainerId(), trainerName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public OwnerStatsResponse getStats(Long ownerId) {
        HorseOwner owner = horseOwnerRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());
        List<RaceHorse> finishedRaces = myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .collect(Collectors.toList());

        long totalRaces = finishedRaces.size();
        long totalWins = 0L;
        long totalRewards = 0L;

        for (RaceHorse rh : finishedRaces) {
            RaceResult result = raceResultRepository.findByRaceHorse_Id(rh.getId()).orElse(null);
            if (result != null) {
                if (result.getRank() == 1L) totalWins++;
                if (result.getRewards() != null) {
                    BigDecimal ownerPercent = rh.getOwnerRevenuePercent() != null
                            ? rh.getOwnerRevenuePercent()
                            : BigDecimal.valueOf(90);
                    totalRewards += BigDecimal.valueOf(result.getRewards())
                            .multiply(ownerPercent)
                            .divide(BigDecimal.valueOf(100), 0, RoundingMode.FLOOR)
                            .longValue();
                }
            }
        }

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

        List<SignHorseResponse> horses = myHorses.stream()
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(),
                            horse.getTrainerId(), trainerName);
                })
                .collect(Collectors.toList());

        List<RaceParticipationResponse> recentHistory = finishedRaces.stream()
                .map(this::buildOwnerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .limit(5)
                .collect(Collectors.toList());

        return OwnerStatsResponse.builder()
                .ownerId(ownerId)
                .name(owner.getName())
                .avatarUrl(owner.getAvatarUrl())
                .coverImageUrl(owner.getCoverImageUrl())
                .description(owner.getDescription())
                .status(owner.getStatus())
                .totalHorses((long) myHorses.size())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .winRate(winRate)
                .totalRewards(totalRewards)
                .horses(horses)
                .recentHistory(recentHistory)
                .build();
    }




    //====================================================================================

    public HorseCurrentStatusResponse mapToCurrentStatusResponse(Horse horse) {
        // Tìm race hiện tại (chưa FINISHED) mà horse này đang tham gia, nếu có
        Optional<RaceHorse> currentRaceHorse = raceHorseRepository.findByHorse_Id(horse.getId())
                .stream()
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED)
                .findFirst();

        return HorseCurrentStatusResponse.builder()
                .horseId(horse.getId())
                .horseName(horse.getHorseName())
                .breed(horse.getBreed())
                .avatarUrl(horse.getAvatarUrl())
                .status(String.valueOf(horse.getStatus()))
                .currentRaceId(currentRaceHorse.map(rh -> rh.getRace().getId()).orElse(null))
                .currentRaceName(currentRaceHorse.map(rh -> rh.getRace().getRaceName()).orElse(null))
                .currentRaceStatus(currentRaceHorse.map(rh -> rh.getRace().getStatus().name()).orElse(null))
                .registrationStatus(String.valueOf(currentRaceHorse.map(RaceHorse::getStatus).orElse(null)))
                .build();
    }

    @Override
    public void SendWithdrawalApplication(WithdrawalRequest with, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

    }

    @Override
    public SignHorseResponse updateHorse(Long horseId, UpdateHorse request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        if (request.getHorseName() != null)   horse.setHorseName(request.getHorseName());
        if (request.getBreed() != null)        horse.setBreed(request.getBreed());
        if (request.getAge() != null)          horse.setAge(request.getAge());
        if (request.getGender() != null)       horse.setGender(request.getGender());
        if (request.getSpeedRating() != null)  horse.setSpeedRating(request.getSpeedRating());
        if (request.getHistory_rank() != null) horse.setRaceHistory(request.getHistory_rank());
        if (request.getAvatar_url() != null)   horse.setAvatarUrl(request.getAvatar_url());
        if (request.getWeight() != null)       horse.setWeight(request.getWeight());
        if (request.getStatus() != null)       horse.setStatus(request.getStatus());

        Horse saved = horseRepository.save(horse);

        String trainerName = saved.getTrainerId() != null
                ? trainerRepository.findById(saved.getTrainerId())
                .map(Trainer::getName).orElse(null)
                : null;

        return mapToResponse(saved, owner.getName(), saved.getTrainerId(), trainerName);
    }
    @Override
    public HorseOwnerProfileResponse completeProfile(CompleteHorseOwnerProfileRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Horse owner profile not found", HttpStatus.NOT_FOUND));

        owner.setName(request.getName());

        if (request.getDescription() != null)    owner.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null)      owner.setAvatarUrl(request.getAvatarUrl());
        if (request.getCoverImageUrl() != null)  owner.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getAddress() != null)        owner.setAddress(request.getAddress());


        HorseOwner saved = horseOwnerRepository.save(owner);

        HorseOwnerProfileResponse resp = mapToProfileResponse(saved);
        resp.setUserId(userId);
        return resp;
    }

    @Override
    public HorseOwnerProfileResponse getMyProfile(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException("Horse owner profile not found", HttpStatus.NOT_FOUND));

        HorseOwnerProfileResponse resp = mapToProfileResponse(owner);
        resp.setUserId(userId);
        return resp;
    }

    private HorseOwnerProfileResponse mapToProfileResponse(HorseOwner owner) {
        // owner.getTotalHorses() is a stored counter nothing ever increments/decrements —
        // count live from the horse table instead, same as getStats()/getHorseList() do.
        int totalHorses = horseRepository.findByOwnerId(owner.getId()).size();
        return HorseOwnerProfileResponse.builder()
                .id(owner.getId())
                .name(owner.getName())
                .description(owner.getDescription())
                .avatarUrl(owner.getAvatarUrl())
                .coverImageUrl(owner.getCoverImageUrl())
                .address(owner.getAddress())
                .totalHorses(totalHorses)
                .status(owner.getStatus())
                .build();
    }

    @Override
    public void deleteHorse(Long horseId, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = horseRepository.findById(horseId)
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        horseRepository.delete(horse);
    }
    @Override
    public List<RaceParticipationResponse> getOwnerRaceHistory(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner not found"));
        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(this::buildOwnerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }
    // Trận sắp tới — tất cả ngựa owner đã đăng ký nhưng chưa đua
    @Override
    public List<RaceParticipationResponse> getOwnerUpcomingRaces(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner not found"));
        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED
                        && rh.getStatus().equals(RaceHorseStatus.APPROVED))  // ← chỉ lấy đã được duyệt
                .map(this::buildOwnerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }
    // Trận đang diễn ra
    @Override
    public List<RaceParticipationResponse> getOwnerCurrentRaces(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner not found"));
        List<Horse> myHorses = horseRepository.findByOwnerId(owner.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.ONGOING)
                .map(this::buildOwnerParticipationResponse)
                .collect(Collectors.toList());
    }
    private RaceParticipationResponse buildOwnerParticipationResponse(RaceHorse rh) {
        RaceResult result = raceResultRepository.findByRaceHorse_Id(rh.getId()).orElse(null);
        String trainerName = null;
        Long trainerId = rh.getHorse().getTrainerId();
        if (trainerId != null) {
            trainerName = trainerRepository.findById(trainerId)
                    .map(t -> t.getUser().getFullName()).orElse(null);
        }

        return RaceParticipationResponse.builder()
                .raceId(rh.getRace().getId())
                .raceName(rh.getRace().getRaceName())
                .raceStatus(rh.getRace().getStatus().name())
                .location(rh.getRace().getLocation())
                .startTime(rh.getRace().getStartTime())
                .horseId(rh.getHorse().getId())
                .horseName(rh.getHorse().getHorseName())
                .horseAvatarUrl(rh.getHorse().getAvatarUrl())
                .jockeyId(rh.getJockey() != null ? rh.getJockey().getId() : null)
                .jockeyName(rh.getJockey() != null
                        ? rh.getJockey().getUser().getFullName() : null)
                .trainerId(trainerId)
                .trainerName(trainerName)
                .rank(result != null ? result.getRank() : null)
                .completionTimeSeconds(result != null ? result.getCompletionTimeSeconds() : null)
                .completionTimeFormatted(result != null
                        ? formatTime(result.getCompletionTimeSeconds()) : null)
                .rewards(result != null ? result.getRewards() : null)
                .registrationStatus(rh.getStatus().name())
                .registerAt(rh.getRegisterAt())
                .build();
    }
    private String formatTime(Double seconds) {
        if (seconds == null) return null;
        int minutes = (int) (seconds / 60);
        double remaining = seconds % 60;
        return String.format("%d:%05.2f", minutes, remaining);
    }






    private SignHorseResponse mapToResponse(Horse horse,
                                            String ownerName,
                                            Long trainerId,
                                            String trainerName) {


        List<String> raceHistory = new ArrayList<>();
        if (horse.getRaceHistory() != null) {
            try {
                raceHistory = objectMapper.readValue(horse.getRaceHistory(),
                        new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        return SignHorseResponse.builder()
                .id(horse.getId())
                .horseName(horse.getHorseName())
                .breed(horse.getBreed())
                .age(horse.getAge())
                .gender(horse.getGender())
                .speedRating(horse.getSpeedRating())
                .raceHistory(raceHistory)  // ← trả về List
                .avatarUrl(horse.getAvatarUrl())
                .weight(horse.getWeight())
                .status(horse.getStatus())
                .ownerId(horse.getOwnerId())
                .ownerName(ownerName)
                .trainerId(trainerId)
                .trainerName(trainerName)
                .build();
    }
}
