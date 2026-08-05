package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.exception.AppException;
import com.horseracing.horseracingmanagement.module.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

/**
 * Dev-local alternative to {@link CloudinaryStorageService}. Saves uploaded images
 * straight to a folder on disk (served back out by {@code WebMvcConfig} at
 * "/uploads/**") so image upload works with zero external accounts or credentials.
 *
 * This is the default provider (see app.storage.provider in application.properties).
 * Do NOT use this in a real deployment: files written here live only on this one
 * machine/container and are lost on redeploy or restart in most hosting setups.
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "local", matchIfMissing = true)
public class LocalFileStorageService implements StorageService {

    private final Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads");

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Files.createDirectories(uploadDir);

            String filename = UUID.randomUUID() + extensionOf(file.getOriginalFilename());
            Path target = uploadDir.resolve(filename).normalize();

            // Guard against a crafted filename escaping the upload directory.
            if (!target.startsWith(uploadDir)) {
                throw new AppException("Invalid file name", HttpStatus.BAD_REQUEST);
            }

            file.transferTo(target);

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(filename)
                    .toUriString();

        } catch (IOException e) {
            log.error("Local upload failed for file '{}'", file.getOriginalFilename(), e);
            throw new AppException("Failed to upload image. Please try again.", HttpStatus.BAD_GATEWAY);
        }
    }

    private String extensionOf(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "";
        }
        return "." + originalFilename
                .substring(originalFilename.lastIndexOf('.') + 1)
                .toLowerCase(Locale.ROOT);
    }
}
