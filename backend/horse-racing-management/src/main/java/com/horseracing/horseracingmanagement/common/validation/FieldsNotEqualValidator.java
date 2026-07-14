package com.horseracing.horseracingmanagement.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;

public class FieldsNotEqualValidator implements ConstraintValidator<FieldsNotEqual, Object> {

    private String field1;
    private String field2;
    private String message;

    @Override
    public void initialize(FieldsNotEqual constraintAnnotation) {
        this.field1 = constraintAnnotation.field1();
        this.field2 = constraintAnnotation.field2();
        this.message = constraintAnnotation.message();
    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext context) {
        if (obj == null) {
            return true;
        }

        Field f1 = ReflectionUtils.findField(obj.getClass(), field1);
        Field f2 = ReflectionUtils.findField(obj.getClass(), field2);

        if (f1 == null || f2 == null) {
            return true;
        }

        ReflectionUtils.makeAccessible(f1);
        ReflectionUtils.makeAccessible(f2);

        Object value1 = ReflectionUtils.getField(f1, obj);
        Object value2 = ReflectionUtils.getField(f2, obj);

        if (value1 == null || value2 == null) {
            return true;
        }

        boolean isValid = !value1.toString().equals(value2.toString());

        if (!isValid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(message)
                    .addPropertyNode(field2)
                    .addConstraintViolation();
        }

        return isValid;
    }
}
