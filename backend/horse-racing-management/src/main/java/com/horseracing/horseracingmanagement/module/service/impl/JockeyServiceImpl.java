package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.dto.JockeyDto.CompleteJockeyProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyProfileResponse;
import com.horseracing.horseracingmanagement.module.entity.Jockey;
import com.horseracing.horseracingmanagement.module.entity.RaceHorse;
import com.horseracing.horseracingmanagement.module.entity.RaceResult;
import com.horseracing.horseracingmanagement.module.responsitory.JockeyRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceHorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.service.JockeyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JockeyServiceImpl implements JockeyService {

    private final JockeyRepository jockeyRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceResultRepository raceResultRepository;

    @Override
    public JockeyProfileResponse completeProfile(CompleteJockeyProfileRequest request, Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));

        if (request.getAge() != null) jockey.setAge(request.getAge());
        if (request.getExperienceYear() != null) jockey.setExperienceYear(request.getExperienceYear());
        if (request.getDescription() != null) jockey.setDescription(request.getDescription());

        return mapToProfileResponse(jockeyRepository.save(jockey));
    }

    @Override
    public JockeyProfileResponse getMyProfile(Long userId) {
        Jockey jockey = jockeyRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Jockey profile not found"));
        return mapToProfileResponse(jockey);
    }

    @Override
    public JockeyProfileResponse getJockeyProfile(Long jockeyId) {
        Jockey jockey = jockeyRepository.findById(jockeyId)
                .orElseThrow(() -> new RuntimeException("Jockey not found"));
        return mapToProfileResponse(jockey);
    }

    @Override
    public List<JockeyProfileResponse> getAllJockeys() {
        return jockeyRepository.findAll()
                .stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    private JockeyProfileResponse mapToProfileResponse(Jockey jockey) {
        // Tính thống kê race
        List<RaceHorse> raceHorses = raceHorseRepository
                .findByJockey_IdAndStatus(jockey.getId(), "Approved");

        long totalRaces = raceHorses.size();
        long totalWins = raceHorses.stream()
                .filter(rh -> {
                    Optional<RaceResult> result = raceResultRepository
                            .findByRaceHorse_Id(rh.getId());
                    return result.isPresent() && result.get().getRank() == 1L;
                })
                .count();

        double winRate = totalRaces > 0
                ? Math.round((double) totalWins / totalRaces * 100.0) : 0.0;

        return JockeyProfileResponse.builder()
                .id(jockey.getId())
                .userId(jockey.getUser().getId())
                .name(jockey.getUser().getFullName() != null
                        ? jockey.getUser().getFullName()
                        : jockey.getUser().getUsername())
                .age(jockey.getAge())
                .experienceYear(jockey.getExperienceYear())
                .description(jockey.getDescription())
                .status(jockey.getStatus())
                .totalRaces(totalRaces)
                .totalWins(totalWins)
                .winRate(winRate)
                .build();
    }
}
