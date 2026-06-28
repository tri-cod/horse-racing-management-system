package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseRaceHistoryResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class HorseOwnerServiceImpl implements HorseOwnerService {


    private final HorseRepository horseRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceRepository raceRepository;
    private final RaceResultRepository raceResultRepository;


    @Override
    public SignHorseResponse signHorse(SignHorseRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Horse horse = Horse.builder()
                .ownerId(owner.getId())
                .horseName(request.getHorseName())
                .breed(request.getBreed())
                .age(request.getAge())
                .gender(request.getGender())
                .speedRating(request.getSpeedRating())
                .historyRank(request.getHistory_rank())
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
    public List<SignHorseResponse> getAvailableHorseList(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        List<Horse> ownerHorses = horseRepository.findByOwnerId(owner.getId());

        // Lấy danh sách horseId đã đăng ký vào bất kỳ race nào (Pending/Approved)
        List<Long> horsesInRace = raceHorseRepository.findHorseIdsAlreadyInAnyRace();

        // Lọc ra horse chưa đăng ký race nào
        return ownerHorses.stream()
                .filter(horse -> !horsesInRace.contains(horse.getId()))
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(), horse.getTrainerId(), trainerName);
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

    // Horse của owner mà CHƯA đăng ký vào race cụ thể này (tránh đăng ký trùng)
    @Override
    public List<SignHorseResponse> getAvailableHorseList(Long userId, Long raceId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        List<Horse> ownerHorses = horseRepository.findByOwnerId(owner.getId());
        List<Long> horsesInThisRace = raceHorseRepository.findHorseIdsByRaceId(raceId);

        return ownerHorses.stream()
                .filter(horse -> !horsesInThisRace.contains(horse.getId()))
                .map(horse -> {
                    String trainerName = horse.getTrainerId() != null
                            ? trainerRepository.findById(horse.getTrainerId())
                            .map(t -> t.getUser().getFullName()).orElse(null)
                            : null;
                    return mapToResponse(horse, owner.getName(), horse.getTrainerId(), trainerName);
                })
                .collect(Collectors.toList());
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
                            .registrationStatus(rh.getStatus())
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
                        .registrationStatus(rh.getStatus())
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
                        .registrationStatus(rh.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

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
                .registrationStatus(currentRaceHorse.map(RaceHorse::getStatus).orElse(null))
                .build();
    }




    private SignHorseResponse mapToResponse(Horse horse,
                                            String ownerName,
                                            Long trainerId,
                                            String trainerName) {
        return SignHorseResponse.builder()
                .id(horse.getId())
                .horseName(horse.getHorseName())
                .breed(horse.getBreed())
                .age(horse.getAge())
                .gender(horse.getGender())
                .speedRating(horse.getSpeedRating())
                .historyRank(horse.getHistoryRank())
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
