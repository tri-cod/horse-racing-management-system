package com.horseracing.horseracingmanagement.module.service.impl.emailOTP;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class MailService {
    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        String subject = purpose.equals("VERIFY_EMAIL")
                ? "Verify Your Email"
                : "Reset Your Password";

        String body = """
            <h2>Your OTP Code</h2>
            <p>Use the code below to %s:</p>
            <h1 style="letter-spacing:4px">%s</h1>
            <p>This code expires in <strong>5 minutes</strong>. Do not share it.</p>
            """.formatted(purpose.equals("VERIFY_EMAIL") ? "verify your email" : "reset your password", otp);

        MimeMessage message = mailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, true);  // true = HTML
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

}