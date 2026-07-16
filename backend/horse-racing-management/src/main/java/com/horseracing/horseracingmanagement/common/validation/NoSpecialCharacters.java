package com.horseracing.horseracingmanagement.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoSpecialCharactersValidator.class)
@Documented
public @interface NoSpecialCharacters {

    String message() default "Must not contain special characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
