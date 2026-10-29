package com.parking.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = VehicleNumberValidator.class)
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.ANNOTATION_TYPE, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface VehicleNumber {

    String message() default "Invalid vehicle registration number format (e.g. KA01AB1234, DL 01 A 1234, 22BH1234AA).";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
