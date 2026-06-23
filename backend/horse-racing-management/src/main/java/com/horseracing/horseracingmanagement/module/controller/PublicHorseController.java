package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseDto.HorseCurrentStatusResponse;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/horses")
@RequiredArgsConstructor
@Tag(name = "Public Horse", description = "Public horse viewing APIs for spectators")
public class PublicHorseController {

    private final HorseOwnerService horseOwnerService;

    // Spectator/ai cũng xem được — toàn bộ horse + race hiện tại đang tham gia
    @GetMapping
    public ResponseEntity<ApiResponse<List<HorseCurrentStatusResponse>>> getAllHorses() {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getAllHorsesWithCurrentRace()));
    }

    // Spectator xem cụ thể những horse nào đang trong 1 race để đặt cược
    @GetMapping("/by-race/{raceId}")
    public ResponseEntity<ApiResponse<List<HorseCurrentStatusResponse>>> getHorsesByRace(
            @PathVariable Long raceId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorsesByRaceId(raceId)));
    }
}