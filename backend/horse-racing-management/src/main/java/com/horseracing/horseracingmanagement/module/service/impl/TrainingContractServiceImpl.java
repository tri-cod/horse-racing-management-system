package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.NotificationType;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SendTrainingContractRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainingContractResponse;
import com.horseracing.horseracingmanagement.module.entity.*;
import com.horseracing.horseracingmanagement.module.responsitory.*;
import com.horseracing.horseracingmanagement.module.service.NotificationService;
import com.horseracing.horseracingmanagement.module.service.TrainingContractService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainingContractServiceImpl implements TrainingContractService {

    private final TrainingContractRepository contractRepository;
    private final HorseRepository horseRepository;
    private final TrainerRepository trainerRepository;
    private final HorseOwnerRepository horseOwnerRepository;
    private final WalletRepository walletRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TrainingContractResponse sendContract(SendTrainingContractRequest request, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Horse owner not found"));

        Horse horse = horseRepository.findById(request.getHorseId())
                .orElseThrow(() -> new RuntimeException("Horse not found"));

        // Check đúng owner không
        if (!horse.getOwnerId().equals(owner.getId())) {
            throw new RuntimeException("You are not the owner of this horse");
        }

        // Check horse đang có contract ACTIVE chưa
        contractRepository.findByHorse_IdAndStatus(horse.getId(), "ACTIVE")
                .ifPresent(c -> {
                    throw new RuntimeException(
                            "Horse already has an active training contract with trainer: "
                                    + c.getTrainer().getUser().getFullName());
                });

        Trainer trainer = trainerRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        // Check trainer còn chỗ không
        if (trainer.getMaxHorses() != null) {
            long currentHorses = contractRepository
                    .countByTrainer_IdAndStatus(trainer.getId(), "ACTIVE");
            if (currentHorses >= trainer.getMaxHorses()) {
                throw new RuntimeException("Trainer is at full capacity (" +
                        trainer.getMaxHorses() + " horses)");
            }
        }

        // Validate ngày hợp lý
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        TrainingContract contract = TrainingContract.builder()
                .horse(horse)
                .trainer(trainer)
                .owner(owner)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .fee(request.getFee())
                .feeType(request.getFeeType())
                .ownerNote(request.getOwnerNote())
                .status("PENDING")
                .build();

        TrainingContract saved = contractRepository.save(contract);

        // Notify trainer
        notificationService.sendToUser(
                trainer.getUser().getId(),
                "🐴 New Training Request",
                String.format("""
                    Owner '%s' wants to hire you to train horse '%s'.
                    📅 Period: %s → %s
                    💰 Fee: %s (%s)
                    📝 Note: %s
                    Please accept or decline.""",
                        owner.getName(),
                        horse.getHorseName(),
                        request.getStartDate(),
                        request.getEndDate(),
                        request.getFee(),
                        request.getFeeType(),
                        request.getOwnerNote() != null ? request.getOwnerNote() : "N/A"),
                NotificationType.SYSTEM,
                saved.getId()
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TrainingContractResponse acceptContract(Long contractId, String trainerNote, Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        TrainingContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getTrainer().getId().equals(trainer.getId())) {
            throw new RuntimeException("This contract is not for you");
        }

        if (!"PENDING".equals(contract.getStatus())) {
            throw new RuntimeException("Contract is not pending");
        }

        // ← Trừ tiền từ ví owner (escrow — giữ tiền cho đến khi hợp đồng xong)
        Wallet ownerWallet = walletRepository
                .findByUser_Id(contract.getOwner().getUser().getId())
                .orElseThrow(() -> new RuntimeException("Owner wallet not found"));

        if (ownerWallet.getBalance().compareTo(contract.getFee()) < 0) {
            throw new RuntimeException("Owner has insufficient balance");
        }

        ownerWallet.setBalance(ownerWallet.getBalance().subtract(contract.getFee()));
        walletRepository.save(ownerWallet);

        // ← Cập nhật Horse — gán trainerId
        Horse horse = contract.getHorse();
        horse.setTrainerId(contract.getTrainer().getId());
        horseRepository.save(horse);

        contract.setStatus("ACTIVE");
        contract.setTrainerNote(trainerNote);
        contract.setAcceptedAt(Instant.now());
        TrainingContract saved = contractRepository.save(contract);

        // Notify owner
        notificationService.sendToUser(
                contract.getOwner().getUser().getId(),
                "✅ Training Contract Accepted!",
                String.format("Trainer '%s' accepted your contract for horse '%s'. Fee of %s deducted from your wallet.",
                        trainer.getUser().getFullName(),
                        horse.getHorseName(),
                        contract.getFee()),
                NotificationType.SYSTEM,
                contractId
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TrainingContractResponse rejectContract(Long contractId, String trainerNote, Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        TrainingContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getTrainer().getId().equals(trainer.getId())) {
            throw new RuntimeException("This contract is not for you");
        }

        if (!"PENDING".equals(contract.getStatus())) {
            throw new RuntimeException("Contract is not pending");
        }

        contract.setStatus("REJECTED");
        contract.setTrainerNote(trainerNote);
        TrainingContract saved = contractRepository.save(contract);

        // Notify owner
        notificationService.sendToUser(
                contract.getOwner().getUser().getId(),
                "❌ Training Contract Rejected",
                String.format("Trainer '%s' declined your contract for horse '%s'. Reason: %s",
                        trainer.getUser().getFullName(),
                        contract.getHorse().getHorseName(),
                        trainerNote != null ? trainerNote : "N/A"),
                NotificationType.SYSTEM,
                contractId
        );

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public TrainingContractResponse cancelContract(Long contractId, Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));

        TrainingContract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (!contract.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("This contract is not yours");
        }

        if (!"PENDING".equals(contract.getStatus())) {
            throw new RuntimeException("Can only cancel PENDING contracts");
        }

        contract.setStatus("CANCELLED");
        TrainingContract saved = contractRepository.save(contract);

        // Notify trainer
        notificationService.sendToUser(
                contract.getTrainer().getUser().getId(),
                "Contract Cancelled",
                String.format("Owner '%s' cancelled the training contract for horse '%s'.",
                        owner.getName(),
                        contract.getHorse().getHorseName()),
                NotificationType.SYSTEM,
                contractId
        );

        return mapToResponse(saved);
    }

    @Override
    public List<TrainingContractResponse> getMyContractsAsOwner(Long userId) {
        HorseOwner owner = horseOwnerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        return contractRepository.findByOwner_Id(owner.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TrainingContractResponse> getMyContractsAsTrainer(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        return contractRepository.findByTrainer_Id(trainer.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TrainingContractResponse> getHorseContracts(Long horseId) {
        return contractRepository.findByHorse_Id(horseId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<TrainingContractResponse> getPendingRequests(Long userId) {
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        return contractRepository.findByTrainer_IdAndStatus(trainer.getId(), "PENDING")
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private TrainingContractResponse mapToResponse(TrainingContract c) {
        // Tính số ngày còn lại
        Long daysRemaining = null;
        Long totalDays = null;
        Double progressPercent = null;

        if ("ACTIVE".equals(c.getStatus()) && c.getStartDate() != null && c.getEndDate() != null) {
            LocalDate today = LocalDate.now();
            totalDays = (long) c.getStartDate().until(c.getEndDate()).getDays();
            long daysPassed = c.getStartDate().until(today).getDays();
            daysRemaining = Math.max(0, totalDays - daysPassed);
            progressPercent = totalDays > 0
                    ? Math.min(100.0, (double) daysPassed / totalDays * 100) : 0.0;
        }

        return TrainingContractResponse.builder()
                .id(c.getId())
                .horseId(c.getHorse().getId())
                .horseName(c.getHorse().getHorseName())
                .horseAvatarUrl(c.getHorse().getAvatarUrl())
                .trainerId(c.getTrainer().getId())
                .trainerName(c.getTrainer().getUser().getFullName())
                .trainerAvatarUrl(c.getTrainer().getAvatarUrl())
                .ownerId(c.getOwner().getId())
                .ownerName(c.getOwner().getName())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .fee(c.getFee())
                .feeType(c.getFeeType())
                .ownerNote(c.getOwnerNote())
                .trainerNote(c.getTrainerNote())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .acceptedAt(c.getAcceptedAt())
                .daysRemaining(daysRemaining)
                .totalDays(totalDays)
                .progressPercent(progressPercent)
                .build();
    }
}
