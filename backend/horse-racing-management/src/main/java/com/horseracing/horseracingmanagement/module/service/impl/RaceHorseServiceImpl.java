package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceHorseResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RegisterRaceHorseRequest;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
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

    private final NotificationService notificationService;
    @Override
    public RaceHorseResponse registerHorseToRace(RegisterRaceHorseRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner profile not found"));

        Race race = raceRepository.findById(request.getRaceId())
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (!race.getStatus().equals("Upcoming")) {
            throw new RuntimeException("Race is not open for registration");
        }

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        if (horse.getTrainerId() == null) {
            throw new RuntimeException("Horse must have a trainer before registering");
        }

        // ← lấy jockey
        Jockey jockey = jockeyRepository.findById(request.getJockeyId())
                .orElseThrow(() -> new RuntimeException("Jockey not found"));

        if (raceHorseRepository.existsByRace_IdAndHorse_Id(race.getId(), horse.getId())) {
            throw new RuntimeException("Horse already registered in this race");
        }

        // Check jockey đã tham gia race này chưa
        if (raceHorseRepository.existsByRace_IdAndJockey_Id(race.getId(), jockey.getId())) {
            throw new RuntimeException("Jockey already assigned in this race");
        }

        if (race.getRegistrationDeadline() != null &&
                Instant.now().isAfter(race.getRegistrationDeadline())) {
            throw new RuntimeException("Registration deadline has passed");
        }

        long registered = raceHorseRepository.countByRace_IdAndStatus(race.getId(), "Approved");
        if (race.getCapacity() != null && registered >= race.getCapacity()) {
            throw new RuntimeException("Race is full");
        }

        RaceHorse raceHorse = RaceHorse.builder()
                .race(race)
                .horse(horse)
                .jockey(jockey)  // ← thêm
                .status("Pending")
                .build();

        return mapToResponse(raceHorseRepository.save(raceHorse));
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
        raceHorse.setStatus("Approved");
        return mapToResponse(raceHorseRepository.save(raceHorse));
    }

    @Override
    public RaceHorseResponse rejectHorse(Long raceHorseId) {
        RaceHorse raceHorse = raceHorseRepository.findById(raceHorseId)
                .orElseThrow(() -> new RuntimeException("RaceHorse not found"));
        raceHorse.setStatus("Rejected");
        return mapToResponse(raceHorseRepository.save(raceHorse));
    }

    private RaceHorseResponse mapToResponse(RaceHorse raceHorse) {
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
                .build();
    }
}