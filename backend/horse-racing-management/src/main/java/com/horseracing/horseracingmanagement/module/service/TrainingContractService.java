package com.horseracing.horseracingmanagement.module.service;

import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SendTrainingContractRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainingContractResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface TrainingContractService {
    TrainingContractResponse sendContract(SendTrainingContractRequest request, Long userId);
    TrainingContractResponse acceptContract(Long contractId, String trainerNote, Long userId);
    TrainingContractResponse rejectContract(Long contractId, String trainerNote, Long userId);
    TrainingContractResponse cancelContract(Long contractId, Long userId);

    // System-triggered (scheduled job) — pays the escrowed fee out to the trainer
    // once an ACTIVE contract's term has ended.
    TrainingContractResponse completeContract(Long contractId);

    List<TrainingContractResponse> getMyContractsAsOwner(Long userId);
    List<TrainingContractResponse> getMyContractsAsTrainer(Long userId);
    List<TrainingContractResponse> getHorseContracts(Long horseId);

    // Trainer xem pending requests
    List<TrainingContractResponse> getPendingRequests(Long userId);
}