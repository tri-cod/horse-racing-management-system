package com.horseracing.horseracingmanagement.module.service.impl.emailOTP;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.stereotype.Service;

import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Service
@Slf4j
public class EmailValidatorService {

    // Bước 1 — Check format email hợp lệ không
    public boolean isValidFormat(String email) {
        return EmailValidator.getInstance().isValid(email);
    }

    // Bước 2 — Check domain có tồn tại không (DNS lookup)
    public boolean isDomainExists(String email) {
        try {
            String domain = email.substring(email.indexOf("@") + 1);

            Future<Boolean> future = Executors.newSingleThreadExecutor().submit(() -> {
                try {
                    Hashtable<String, String> env = new Hashtable<>();
                    env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
                    env.put("com.sun.jndi.dns.timeout.initial", "2000");
                    env.put("com.sun.jndi.dns.timeout.retries", "1");

                    DirContext ctx = new InitialDirContext(env);
                    ctx.getAttributes(domain, new String[]{"MX"});
                    ctx.close();
                    return true;
                } catch (Exception e) {
                    log.warn("DNS MX lookup failed for domain '{}': {}", domain, e.getMessage());
                    return false;
                }
            });

            return future.get(3, TimeUnit.SECONDS);

        } catch (TimeoutException e) {
            log.warn("DNS lookup timeout for email '{}' — allowing through", email);
            return true;  // ← timeout thì cho qua
        } catch (Exception e) {
            log.error("Unexpected error checking domain for email '{}': {}", email, e.getMessage());
            return false;
        }
    }
}