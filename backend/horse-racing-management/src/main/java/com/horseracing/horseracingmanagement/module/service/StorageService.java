package com.horseracing.horseracingmanagement.module.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Stores user-uploaded files on an external host, so they survive redeploys.
 * Kept provider-agnostic: swapping Cloudinary for S3/R2 later means adding a new
 * implementation, not touching the controllers.
 */
public interface StorageService {

    /**
     * Uploads an image and returns its public HTTPS URL — the value callers persist
     * in the various {@code avatar_url} columns.
     *
     * @throws com.horseracing.horseracingmanagement.common.exception.AppException if the upload fails
     */
    String uploadImage(MultipartFile file);
}
