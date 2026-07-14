package com.horseracing.horseracingmanagement.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = FieldsNotEqualValidator.class)
@Documented
public @interface FieldsNotEqual {

    String message() default "Username and password cannot be the same";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String field1() default "username";

    String field2() default "password";
}
