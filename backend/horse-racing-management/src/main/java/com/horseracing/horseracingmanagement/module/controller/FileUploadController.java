package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.service.StorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Set;

/**
 * Generic upload endpoint shared by every avatar picker (user, horse, jockey,
 * trainer, referee, race). It used to live on HorseOwnerController despite never
 * being horse-owner specific — and without any authorization check.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload APIs")
public class FileUploadController {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE,
            "image/webp");

    private final StorageService storageService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null
                || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new AppException("Only JPEG, PNG, GIF or WEBP images are allowed");
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Image uploaded successfully", storageService.uploadImage(file)));
    }
}
