package com.horseracing.horseracingmanagement.module.service.impl;


import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final long OTP_TTL_MINUTES = 5;
    private static final int OTP_LENGTH = 6;

    public String generateAndStoreOtp(String email, String purpose) {
        String otp = String.format("%06d", new SecureRandom().nextInt(999999));
        String key = buildKey(email, purpose);  // e.g. "otp:VERIFY_EMAIL:user@example.com"

        redisTemplate.opsForValue().set(key, otp, OTP_TTL_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    public boolean verifyOtp(String email, String purpose, String inputOtp) {
        String key = buildKey(email, purpose);
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp != null && storedOtp.equals(inputOtp)) {
            redisTemplate.delete(key);  // One-time use
            return true;
        }
        return false;
    }

    private String buildKey(String email, String purpose) {
        return "otp:" + purpose + ":" + email;
    }
}