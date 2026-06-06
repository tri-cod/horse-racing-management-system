package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.entity.Horse;
import com.horseracing.horseracingmanagement.module.entity.HorseOwner;
import com.horseracing.horseracingmanagement.module.entity.Trainer;
import com.horseracing.horseracingmanagement.module.responsitory.HorseOwnerRepository;
import com.horseracing.horseracingmanagement.module.responsitory.HorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class HorseOwnerServiceImpl implements HorseOwnerService {


    private final HorseRepository horseRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final TrainerRepository trainerRepository;
    private final UserRepository userRepository;


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





    private SignHorseResponse mapToResponse(Horse horse,        // ← phải là Horse
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
