package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SendTrainingContractRequest;
import com.horseracing.horseracingmanagement.module.dto.Trainer.TrainingContractResponse;
import com.horseracing.horseracingmanagement.module.service.TrainingContractService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-contracts")
@RequiredArgsConstructor
@Tag(name = "Training Contract", description = "Training contract management APIs")
public class TrainingContractController {

    @Qualifier("trainingContractService")
    private final TrainingContractService contractService;

    // Owner gửi contract cho trainer
    @PostMapping
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<TrainingContractResponse>> sendContract(
            @Valid @RequestBody SendTrainingContractRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contract sent to trainer",
                        contractService.sendContract(request, userDetails.getId())));
    }

    // Trainer xem pending requests
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<List<TrainingContractResponse>>> getPendingRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                contractService.getPendingRequests(userDetails.getId())));
    }

    // Trainer chấp nhận
    @PutMapping("/{id}/accept")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<TrainingContractResponse>> acceptContract(
            @PathVariable Long id,
            @RequestParam(required = false) String trainerNote,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Contract accepted",
                contractService.acceptContract(id, trainerNote, userDetails.getId())));
    }

    // Trainer từ chối
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<TrainingContractResponse>> rejectContract(
            @PathVariable Long id,
            @RequestParam(required = false) String trainerNote,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Contract rejected",
                contractService.rejectContract(id, trainerNote, userDetails.getId())));
    }

    // Owner hủy (khi còn PENDING)
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<TrainingContractResponse>> cancelContract(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Contract cancelled",
                contractService.cancelContract(id, userDetails.getId())));
    }

    // Owner xem contracts của mình
    @GetMapping("/my-contracts")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<TrainingContractResponse>>> getMyContractsAsOwner(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                contractService.getMyContractsAsOwner(userDetails.getId())));
    }

    // Trainer xem contracts của mình
    @GetMapping("/my-trainer-contracts")
    @PreAuthorize("hasAuthority('TRAINER')")
    public ResponseEntity<ApiResponse<List<TrainingContractResponse>>> getMyContractsAsTrainer(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                contractService.getMyContractsAsTrainer(userDetails.getId())));
    }

    // Xem lịch sử contract của 1 horse (public)
    @GetMapping("/horse/{horseId}")
    public ResponseEntity<ApiResponse<List<TrainingContractResponse>>> getHorseContracts(
            @PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                contractService.getHorseContracts(horseId)));
    }
}