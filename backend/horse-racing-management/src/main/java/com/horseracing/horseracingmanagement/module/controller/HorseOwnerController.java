package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.*;
import com.horseracing.horseracingmanagement.module.dto.RaceHorseDto.RaceParticipationResponse;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/horse-owner")
@RequiredArgsConstructor
@Tag(name = "Horse Owner", description = "Horse Owner management APIs")
public class HorseOwnerController {

    private final HorseOwnerService horseOwnerService;

    @PostMapping("/horses/avatar")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file
    ) {
        try {
            // Tạo thư mục uploads nếu chưa có
            String uploadDir = System.getProperty("user.dir") + "/uploads";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // Đặt tên file unique để tránh trùng (giữ extension gốc)
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String uniqueFileName = java.util.UUID.randomUUID() + extension;

            // Lưu file vào ổ đĩa
            java.io.File destFile = new java.io.File(uploadDir, uniqueFileName);
            file.transferTo(destFile);

            // Trả về URL đầy đủ để frontend hiển thị được
            String imageUrl = "http://localhost:8080/uploads/" + uniqueFileName;

            return ResponseEntity.ok(
                    ApiResponse.success("Avatar uploaded successfully", imageUrl)
            );
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload avatar: " + e.getMessage()));
        }
    }

    @PostMapping("/horses")
    public ResponseEntity<ApiResponse<SignHorseResponse>> signHorse(
            @Valid @RequestBody SignHorseRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) { // ← lấy từ token


        Long userId = userDetails.getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Horse registered successfully",
                        horseOwnerService.signHorse(request, userId)));
    }

    @GetMapping("/horses/{horseId}")
    public ResponseEntity<ApiResponse<SignHorseResponse>> getHorse(@PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorse(horseId)));
    }

    // Xem lịch sử phạt của 1 con ngựa mình sở hữu
    @GetMapping("/horses/{horseId}/penalties")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<com.horseracing.horseracingmanagement.module.dto.RefereeDto.PenaltyResponse>>> getHorsePenalties(
            @PathVariable Long horseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorsePenalties(horseId, userDetails.getId())));
    }

    // Toàn bộ phạt trên tất cả ngựa của mình — dùng cho bảng My Horses
    @GetMapping("/penalties")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<com.horseracing.horseracingmanagement.module.dto.RefereeDto.PenaltyResponse>>> getMyPenalties(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getMyPenalties(userDetails.getId())));
    }

    @GetMapping("/horses")
    public ResponseEntity<ApiResponse<List<SignHorseResponse>>> getHorseList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorseList(userId)));
    }

    @GetMapping("/horses/available")
    public ResponseEntity<ApiResponse<List<SignHorseResponse>>> getAvailableHorses(
            @RequestParam Long raceId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getAvailableHorseList(userDetails.getId(), raceId)));
    }
    @PatchMapping("/horses/{horseId}")
    public ResponseEntity<ApiResponse<SignHorseResponse>> updateHorse(
            @PathVariable Long horseId,
            @Valid @RequestBody UpdateHorse request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Horse updated successfully",
                horseOwnerService.updateHorse(horseId, request, userId)));
    }

    @DeleteMapping("/horses/{horseId}")
    public ResponseEntity<ApiResponse<Void>> deleteHorse(
            @PathVariable Long horseId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        horseOwnerService.deleteHorse(horseId, userId);
        return ResponseEntity.ok(ApiResponse.success("Horse deleted successfully", null));
    }
    @GetMapping("/race-history")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getOwnerRaceHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getOwnerRaceHistory(userDetails.getId())));
    }
    @GetMapping("/upcoming-races")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getOwnerUpcomingRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getOwnerUpcomingRaces(userDetails.getId())));
    }
    @GetMapping("/current-races")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getOwnerCurrentRaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getOwnerCurrentRaces(userDetails.getId())));
    }


    @GetMapping("/{ownerId}/race-history")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getOwnerRaceHistoryPublic(
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getOwnerRaceHistoryById(ownerId)));
    }

    @GetMapping("/{ownerId}/upcoming-races")
    public ResponseEntity<ApiResponse<List<RaceParticipationResponse>>> getOwnerUpcomingRacesPublic(
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getOwnerUpcomingRacesById(ownerId)));
    }

    @GetMapping("/{ownerId}/horses")
    public ResponseEntity<ApiResponse<List<SignHorseResponse>>> getOwnerHorsesPublic(
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorsesByOwnerId(ownerId)));
    }

    @GetMapping("/{ownerId}/stats")
    public ResponseEntity<ApiResponse<OwnerStatsResponse>> getOwnerStats(
            @PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getStats(ownerId)));
    }
    @PutMapping("/profile/complete")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<HorseOwnerProfileResponse>> completeProfile(
            @Valid @RequestBody CompleteHorseOwnerProfileRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Profile completed successfully",
                horseOwnerService.completeProfile(request, userId)));
    }

    @GetMapping("/profile/me")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<HorseOwnerProfileResponse>> getMyProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getMyProfile(userDetails.getId())));
    }

    // ===== Horse image gallery =====

    // Upload file ảnh trực tiếp lên server và thêm luôn vào gallery của ngựa (tiện nhất cho FE)
    @PostMapping("/horses/{horseId}/images/upload")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<String>>> uploadHorseImage(
            @PathVariable Long horseId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads";
            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }
            String uniqueFileName = java.util.UUID.randomUUID() + extension;

            java.io.File destFile = new java.io.File(uploadDir, uniqueFileName);
            file.transferTo(destFile);

            String imageUrl = "http://localhost:8080/uploads/" + uniqueFileName;

            AddHorseImageRequest request = AddHorseImageRequest.builder()
                    .imageUrl(imageUrl)
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Image uploaded successfully",
                            horseOwnerService.addHorseImage(horseId, request, userDetails.getId())));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload image: " + e.getMessage()));
        }
    }

    // Thêm ảnh bằng URL có sẵn (VD: đã upload lên Cloudinary/S3 từ FE)
    @PostMapping("/horses/{horseId}/images")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<String>>> addHorseImage(
            @PathVariable Long horseId,
            @Valid @RequestBody AddHorseImageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image added successfully",
                        horseOwnerService.addHorseImage(horseId, request, userDetails.getId())));
    }

    @GetMapping("/horses/{horseId}/images")
    public ResponseEntity<ApiResponse<List<String>>> getHorseImages(
            @PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorseImages(horseId)));
    }

    // Xóa 1 ảnh bằng chính URL của nó (không có id riêng vì ảnh chỉ lưu chung 1 cột JSON)
    @DeleteMapping("/horses/{horseId}/images")
    @PreAuthorize("hasAuthority('HORSE_OWNER')")
    public ResponseEntity<ApiResponse<List<String>>> deleteHorseImage(
            @PathVariable Long horseId,
            @RequestParam String imageUrl,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully",
                horseOwnerService.deleteHorseImage(horseId, imageUrl, userDetails.getId())));
    }

}