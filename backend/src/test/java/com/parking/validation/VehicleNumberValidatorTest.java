package com.parking.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Vehicle Number Normalization and Validation Tests")
class VehicleNumberValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {
            "KA01AB1234",
            "ka 01 ab 1234",
            "MH-12-CD-5678",
            "DL 1 C 9999",
            "DL 01 AA 0001",
            "22BH1234AA",
            "23 BH 5678 B",
            "HR26DQ5551",
            "wb-02-ak-1111"
    })
    @DisplayName("Valid Indian registration numbers should pass after normalization")
    void testValidRegistrationNumbers(String input) {
        assertThat(VehicleNumberUtil.isValid(input)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "INVALID",
            "12345",
            "ABCDEFGHIJ",
            "KA0112345678",
            "123-KA-456",
            "USA-9999"
    })
    @DisplayName("Invalid or malformed vehicle numbers should fail")
    void testInvalidRegistrationNumbers(String input) {
        assertThat(VehicleNumberUtil.isValid(input)).isFalse();
    }

    @Test
    @DisplayName("Normalization removes hyphens, spaces, and uppercases")
    void testNormalization() {
        assertThat(VehicleNumberUtil.normalize("ka-01 ab 1234")).isEqualTo("KA01AB1234");
        assertThat(VehicleNumberUtil.normalize("  dl 12 c 3456  ")).isEqualTo("DL12C3456");
        assertThat(VehicleNumberUtil.normalize(null)).isNull();
    }
}
