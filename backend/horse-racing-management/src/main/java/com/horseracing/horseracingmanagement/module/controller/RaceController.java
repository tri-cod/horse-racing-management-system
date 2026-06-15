package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceResponse;
import com.horseracing.horseracingmanagement.module.service.RaceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/races")
@RequiredArgsConstructor
@Tag(name = "Race", description = "Race management APIs")
public class RaceController {

    private final RaceService raceService;

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")  // ← chỉ ADMIN
    public ResponseEntity<ApiResponse<RaceResponse>> createRace(
            @Valid @RequestBody CreateRaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Race created successfully",
                        raceService.createRace(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RaceResponse>> getRace(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Success", raceService.getRace(id)));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Page<RaceResponse>>> getRaceList(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Success",
                raceService.getRaceList(status, pageable)));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")  // ← chỉ ADMIN
    public ResponseEntity<ApiResponse<RaceResponse>> updateRace(
            @PathVariable Long id,
            @Valid @RequestBody CreateRaceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Race updated successfully",
                raceService.updateRace(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")  // ← chỉ ADMIN
    public ResponseEntity<ApiResponse<String>> deleteRace(@PathVariable Long id) {
        raceService.deleteRace(id);
        return ResponseEntity.ok(ApiResponse.success("Race deleted successfully", null));
    }

    @PutMapping("/{id}/start")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'REFEREE')")
    public ResponseEntity<ApiResponse<RaceResponse>> startRace(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Race started",
                raceService.startRace(id)));
    }

    // Referee/Admin finish race
    @PutMapping("/{id}/finish")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'REFEREE')")
    public ResponseEntity<ApiResponse<RaceResponse>> finishRace(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Race finished",
                raceService.finishRace(id)));
    }
}