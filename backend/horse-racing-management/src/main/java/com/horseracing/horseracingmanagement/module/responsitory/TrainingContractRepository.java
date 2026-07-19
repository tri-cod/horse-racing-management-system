package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.TrainingContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingContractRepository extends JpaRepository<TrainingContract, Long> {
    List<TrainingContract> findByOwner_IdAndStatus(Long ownerId, String status);
    List<TrainingContract> findByOwner_Id(Long ownerId);
    List<TrainingContract> findByTrainer_IdAndStatus(Long trainerId, String status);
    List<TrainingContract> findByTrainer_Id(Long trainerId);
    List<TrainingContract> findByHorse_Id(Long horseId);

    // Check horse đang có contract ACTIVE với trainer nào chưa
    Optional<TrainingContract> findByHorse_IdAndStatus(Long horseId, String status);

    // Trainer đang train bao nhiêu ngựa
    long countByTrainer_IdAndStatus(Long trainerId, String status);
}