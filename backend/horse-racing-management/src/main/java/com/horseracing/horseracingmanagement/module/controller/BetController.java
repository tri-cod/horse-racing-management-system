package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.Bet.BetResponse;
import com.horseracing.horseracingmanagement.module.dto.Bet.CreateBetRequest;
import com.horseracing.horseracingmanagement.module.service.BetService;
import com.horseracing.horseracingmanagement.module.service.impl.BetServiceImpl;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bets")
@RequiredArgsConstructor
public class BetController {

    private final BetService betService;

    @PostMapping
    @PreAuthorize("hasAuthority('USER')")
    public ResponseEntity<ApiResponse<BetResponse>> placeBet(
            @Valid @RequestBody CreateBetRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bet placed successfully",
                        betService.placeBet(request, userDetails.getId())));
    }

    @GetMapping("/my-bets")
    public ResponseEntity<ApiResponse<List<BetResponse>>> getMyBets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                betService.getMyBets(userDetails.getId())));
    }
}