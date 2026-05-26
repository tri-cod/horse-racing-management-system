package com.horseracing.horseracingmanagement.common.util;
import com.horseracing.horseracingmanagement.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityUtil {

    public static Optional<String> getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return Optional.ofNullable(authentication.getName());
    }

    public static Optional<CustomUserDetails> getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            return Optional.of(userDetails);
        }
        return Optional.empty();
    }

    public static Optional<Long> getCurrentUserId() {
        return getCurrentUserDetails().map(CustomUserDetails::getId);
    }
}