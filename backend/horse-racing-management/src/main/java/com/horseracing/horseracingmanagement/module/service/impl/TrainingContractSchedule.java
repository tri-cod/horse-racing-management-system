package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.module.entity.TrainingContract;
import com.horseracing.horseracingmanagement.module.responsitory.TrainingContractRepository;
import com.horseracing.horseracingmanagement.module.service.TrainingContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

// Auto-completes ACTIVE training contracts once their end date has passed, releasing
// the fee escrowed in the admin wallet (see TrainingContractServiceImpl.acceptContract)
// out to the trainer. Without this, contracts stayed ACTIVE forever and the owner's
// fee was never paid to anyone.
@Slf4j
@Component
@RequiredArgsConstructor
public class TrainingContractSchedule {

    private final TrainingContractRepository contractRepository;
    private final TrainingContractService contractService;

    @Scheduled(cron = "0 0 1 * * *") // once a day, 1am
    public void autoCompleteExpiredContracts() {
        LocalDate today = LocalDate.now();
        List<TrainingContract> expiring = contractRepository.findByStatusAndEndDateLessThanEqual("ACTIVE", today);
        for (TrainingContract contract : expiring) {
            try {
                contractService.completeContract(contract.getId());
            } catch (Exception ex) {
                log.error("Auto-complete failed for training contract {}: {}", contract.getId(), ex.getMessage());
            }
        }
    }
}
