package com.horseracing.horseracingmanagement.module.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.horseracing.horseracingmanagement.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

// Only active when app.storage.provider=cloudinary — see CloudinaryConfig and
// LocalFileStorageService for the local-dev default.
@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements StorageService {

    private final Cloudinary cloudinary;

    @Value("${app.cloudinary.upload-folder}")
    private String uploadFolder;

    @Override
    public String uploadImage(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", uploadFolder,
                    // Reject anything Cloudinary cannot decode as an image, even if the
                    // client lied about the Content-Type.
                    "resource_type", "image"));

            String secureUrl = (String) result.get("secure_url");
            if (secureUrl == null) {
                throw new AppException("Image host did not return a URL", HttpStatus.BAD_GATEWAY);
            }
            return secureUrl;

        } catch (IOException e) {
            // The message can carry the host's rejection reason ("Invalid image file"),
            // so log it in full but keep the client-facing text generic.
            log.error("Cloudinary upload failed for file '{}'", file.getOriginalFilename(), e);
            throw new AppException("Failed to upload image. Please try again.", HttpStatus.BAD_GATEWAY);
        }
    }
}
