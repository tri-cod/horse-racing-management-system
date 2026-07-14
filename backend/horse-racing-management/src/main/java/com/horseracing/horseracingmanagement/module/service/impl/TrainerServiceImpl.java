package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.dto.Trainer.CompleteTrainerProfileRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainerProfileResponse;
import com.horseracing.horseracingmanagement.module.entity.Trainer;
import com.horseracing.horseracingmanagement.module.responsitory.TrainerRepository;
import com.horseracing.horseracingmanagement.module.service.TrainerService;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TrainerServiceImpl implements TrainerService {

    private final TrainerRepository trainerRepository;


    @Override
    public TrainerProfileResponse completeProfile(CompleteTrainerProfileRequest request, Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer profile not found"));

        if (request.getAge() != null) trainer.setAge(request.getAge());
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

    private TrainerProfileResponse mapToResponse(Trainer trainer) {
        return TrainerProfileResponse.builder()
                .id(trainer.getId())
                .userId(trainer.getUser().getId())
                .name(trainer.getUser().getFullName() != null  // ← lấy từ user trực tiếp
                        ? trainer.getUser().getFullName()
                        : trainer.getUser().getUsername())
                .avatarUrl(trainer.getAvatarUrl())        // ← thêm
                .coverImageUrl(trainer.getCoverImageUrl())
                .age(trainer.getAge())
                .experienceYears(trainer.getExperienceYears())
                .description(trainer.getDescription())
                .avatarUrl(trainer.getAvatarUrl())
                .status(trainer.getStatus())
                .build();
    }
}
