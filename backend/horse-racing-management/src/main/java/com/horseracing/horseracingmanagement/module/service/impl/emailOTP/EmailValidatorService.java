package com.horseracing.horseracingmanagement.module.service.impl.emailOTP;

import org.apache.commons.validator.routines.EmailValidator;
import org.springframework.stereotype.Service;

import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;

@Service
public class EmailValidatorService {

    // Bước 1 — Check format email hợp lệ không
    public boolean isValidFormat(String email) {
        return EmailValidator.getInstance().isValid(email);
    }

    // Bước 2 — Check domain có tồn tại không (DNS lookup)
    public boolean isDomainExists(String email) {
        try {
            String domain = email.substring(email.indexOf("@") + 1);
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ctx = new InitialDirContext(env);
            ctx.getAttributes(domain, new String[]{"MX"});  // kiểm tra MX record
            return true;
        } catch (Exception e) {
            return false;  // domain không tồn tại
        }
    }
}