package com.horseracing.horseracingmanagement.module.service.impl.emailOTP;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class MailService {

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from:onboarding@resend.dev}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        String subject = "VERIFY_EMAIL".equals(purpose)
                ? "Verify Your Email - Royal Derby"
                : "Reset Your Password - Royal Derby";

        String action = "VERIFY_EMAIL".equals(purpose)
                ? "verify your email"
                : "reset your password";

        String html = """
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#1a2b4a">Royal Derby</h2>
              <p>Use the code below to %s:</p>
              <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#c9a227">%s</p>
              <p>This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            </div>
            """.formatted(action, otp);

        try {
            Resend resend = new Resend(resendApiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from("Royal Derby <" + fromEmail + ">")
                    .to(toEmail)
                    .subject(subject)
                    .html(html)
                    .build();

            CreateEmailResponse data = resend.emails().send(params);
            log.info("✓ OTP email sent via Resend to {} (id={})", toEmail, data.getId());
        } catch (Exception e) {
            log.error("✗ Failed to send OTP email to {}: {}", toEmail, e.getMessage(), e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}