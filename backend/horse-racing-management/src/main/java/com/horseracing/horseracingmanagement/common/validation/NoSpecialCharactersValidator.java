package com.horseracing.horseracingmanagement.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.regex.Pattern;

public class NoSpecialCharactersValidator implements ConstraintValidator<NoSpecialCharacters, String> {

    // Allows unicode letters (kể cả tiếng Việt có dấu), digits and whitespace only
    private static final Pattern SAFE_PATTERN = Pattern.compile("^[\\p{L}\\p{N}\\s]+$");

    @Override
    public void initialize(NoSpecialCharacters constraintAnnotation) {
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isEmpty()) {
            // Let @NotBlank / @Size handle null-or-empty cases
            return true;
        }
        return SAFE_PATTERN.matcher(value).matches();
    }
}
