package com.horseracing.horseracingmanagement.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class ValidPasswordValidator implements ConstraintValidator<ValidPassword, String> {

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[^a-zA-Z0-9]");

    @Override
    public void initialize(ValidPassword constraintAnnotation) {
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isEmpty()) {
            // Let @NotBlank handle the empty/null case
            return true;
        }

        boolean hasUppercase = UPPERCASE_PATTERN.matcher(password).find();
        boolean hasSpecialChar = SPECIAL_CHAR_PATTERN.matcher(password).find();

        if (hasUppercase && hasSpecialChar) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        if (!hasUppercase && !hasSpecialChar) {
            context.buildConstraintViolationWithTemplate(
                    "Password must contain at least one uppercase letter and one special character"
            ).addConstraintViolation();
        } else if (!hasUppercase) {
            context.buildConstraintViolationWithTemplate(
                    "Password must contain at least one uppercase letter"
            ).addConstraintViolation();
        } else {
            context.buildConstraintViolationWithTemplate(
                    "Password must contain at least one special character"
            ).addConstraintViolation();
        }

        return false;
    }
}
