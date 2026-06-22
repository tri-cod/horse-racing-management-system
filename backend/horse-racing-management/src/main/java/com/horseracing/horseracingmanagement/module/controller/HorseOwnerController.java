package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseRequest;
import com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto.SignHorseResponse;
import com.horseracing.horseracingmanagement.module.service.HorseOwnerService;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

        System.out.println("userId từ token: " + userDetails.getId()); // ← thêm dòng này
        System.out.println("username từ token: " + userDetails.getUsername());

        Long userId = userDetails.getId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Horse registered successfully",
                        horseOwnerService.signHorse(request, userId)));
    }

    @PutMapping("/horses/{horseId}/assign-trainer")
    public ResponseEntity<ApiResponse<SignHorseResponse>> assignTrainer(
            @PathVariable Long horseId,
            @RequestParam Long trainerId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        Long userId = userDetails.getId();
        return ResponseEntity.ok(ApiResponse.success("Trainer assigned successfully",
                horseOwnerService.assignTrainer(horseId, trainerId, userId)));
    }

    @GetMapping("/horses/{horseId}")
    public ResponseEntity<ApiResponse<SignHorseResponse>> getHorse(@PathVariable Long horseId) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getHorse(horseId)));
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
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Success",
                horseOwnerService.getAvailableHorseList(userDetails.getId())));
    }
}