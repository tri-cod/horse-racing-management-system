package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerStatsResponse;
import com.horseracing.horseracingmanagement.module.entity.Horse;
import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import com.horseracing.horseracingmanagement.module.entity.Trainer;
import com.horseracing.horseracingmanagement.module.responsitory.HorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceHorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.service.TrainerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;


@Service
@AllArgsConstructor
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;
    private final HorseRepository horseRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceResultRepository raceResultRepository;




    @Override
    public TrainerProfileResponse completeProfile(CompleteTrainerProfileRequest request, Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer profile not found"));

        if (request.getDateOfBirth() != null) trainer.setDateOfBirth(request.getDateOfBirth());
        if (request.getExperienceYears() != null) trainer.setExperienceYears(request.getExperienceYears());
        if (request.getDescription() != null) trainer.setDescription(request.getDescription());
        if (request.getAvatarUrl() != null) trainer.setAvatarUrl(request.getAvatarUrl());            // ← thêm
        if (request.getCoverImageUrl() != null) trainer.setCoverImageUrl(request.getCoverImageUrl()); // ← thêm

        Trainer saved = trainerRepository.save(trainer);
        return mapToResponse(saved);
    }

    @Override
    public TrainerProfileResponse getProfile(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer profile not found"));
        return mapToResponse(trainer);
    }
    @Override
    public List<RaceParticipationResponse> getMyRaceHistory(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
// Tìm tất cả horse mà trainer này đang/đã huấn luyện
        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(this::buildTrainerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }
    @Override
    public List<RaceParticipationResponse> getUpcomingRaces(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED)
                .map(this::buildTrainerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }
    @Override
    public List<RaceParticipationResponse> getCurrentRaces(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());

        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.ONGOING)
                .map(this::buildTrainerParticipationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceParticipationResponse> getRaceHistoryById(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());
        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() == RaceStatus.FINISHED)
                .map(this::buildTrainerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .collect(Collectors.toList());
    }

    @Override
    public List<RaceParticipationResponse> getUpcomingRacesById(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());
        return myHorses.stream()
                .flatMap(horse -> raceHorseRepository.findByHorse_Id(horse.getId()).stream())
                .filter(rh -> rh.getRace().getStatus() != RaceStatus.FINISHED
                        && rh.getRace().getStatus() != RaceStatus.ONGOING
                        && rh.getRace().getStatus() != RaceStatus.CANCELLED)
                .map(this::buildTrainerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.MAX))
                .collect(Collectors.toList());
    }

    @Override
    public TrainerStatsResponse getStats(Long trainerId) {
        Trainer trainer = trainerRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        List<Horse> myHorses = horseRepository.findByTrainerId(trainer.getId());
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
                if (result.getRewards() != null) totalRewards += result.getRewards();
            }
        }

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

        List<RaceParticipationResponse> recentHistory = finishedRaces.stream()
                .map(this::buildTrainerParticipationResponse)
                .sorted(Comparator.comparing(
                        r -> r.getStartTime() != null ? r.getStartTime() : Instant.EPOCH,
                        Comparator.reverseOrder()))
                .limit(5)
                .collect(Collectors.toList());

        return TrainerStatsResponse.builder()
                .trainerId(trainerId)
                .name(trainer.getUser().getFullName() != null
                        ? trainer.getUser().getFullName()
                        : trainer.getUser().getUsername())
                .avatarUrl(trainer.getAvatarUrl())
                .coverImageUrl(trainer.getCoverImageUrl())
                .dateOfBirth(trainer.getDateOfBirth())
                .experienceYears(trainer.getExperienceYears())
                .description(trainer.getDescription())
                .totalHorses((long) myHorses.size())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .winRate(winRate)
                .totalRewards(totalRewards)
                .recentHistory(recentHistory)
                .build();
    }

    private RaceParticipationResponse buildTrainerParticipationResponse(RaceHorse rh) {
        RaceResult result = raceResultRepository.findByRaceHorse_Id(rh.getId()).orElse(null);
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


    private TrainerProfileResponse mapToResponse(Trainer trainer) {
        return TrainerProfileResponse.builder()
                .id(trainer.getId())
                .userId(trainer.getUser().getId())
                .name(trainer.getUser().getFullName() != null  // ← lấy từ user trực tiếp
                        ? trainer.getUser().getFullName()
                        : trainer.getUser().getUsername())
                .avatarUrl(trainer.getAvatarUrl())        // ← thêm
                .coverImageUrl(trainer.getCoverImageUrl())
                .dateOfBirth(trainer.getDateOfBirth())
                .experienceYears(trainer.getExperienceYears())
                .description(trainer.getDescription())
                .avatarUrl(trainer.getAvatarUrl())
                .status(trainer.getStatus())
                .build();
    }
}
