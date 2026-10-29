package com.parking.service;

import com.parking.config.ParkingProperties;
import com.parking.exception.InvalidDurationException;
import com.parking.exception.InvalidTimestampException;
import com.parking.service.impl.FeeCalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Fee Calculation Service Unit Tests")
class FeeCalculationServiceTest {

    private FeeCalculationService feeCalculationService;

    @BeforeEach
    void setUp() {
        ParkingProperties properties = new ParkingProperties();
        properties.getPricing().setBlockDurationSeconds(10800); // 3 hours
        properties.getPricing().setBlockRateInr(50); // ₹50 per block
        feeCalculationService = new FeeCalculationServiceImpl(properties);
    }

    @Test
    @DisplayName("1. Zero duration results in ₹0.00")
    void testZeroDurationPolicy() {
        BigDecimal fee = feeCalculationService.calculateFee(0);
        assertThat(fee).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(fee.scale()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("2. One minute (60 seconds) = ₹50.00")
    void testOneMinute() {
        BigDecimal fee = feeCalculationService.calculateFee(60);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(50).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("3. Two hours fifteen minutes (8100 seconds) = ₹50.00")
    void testTwoHoursFifteenMinutes() {
        long durationSeconds = (2 * 3600) + (15 * 60); // 8100 seconds
        BigDecimal fee = feeCalculationService.calculateFee(durationSeconds);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(50).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("4. Exactly three hours (10800 seconds) = ₹50.00")
    void testExactlyThreeHours() {
        long durationSeconds = 3 * 3600; // 10800 seconds
        BigDecimal fee = feeCalculationService.calculateFee(durationSeconds);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(50).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("5. Three hours five minutes (11100 seconds) = ₹100.00")
    void testThreeHoursFiveMinutes() {
        long durationSeconds = (3 * 3600) + (5 * 60); // 11100 seconds
        BigDecimal fee = feeCalculationService.calculateFee(durationSeconds);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(100).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("6. Exactly six hours (21600 seconds) = ₹100.00")
    void testExactlySixHours() {
        long durationSeconds = 6 * 3600; // 21600 seconds
        BigDecimal fee = feeCalculationService.calculateFee(durationSeconds);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(100).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("7. Six hours one minute (21660 seconds) = ₹150.00")
    void testSixHoursOneMinute() {
        long durationSeconds = (6 * 3600) + 60; // 21660 seconds
        BigDecimal fee = feeCalculationService.calculateFee(durationSeconds);
        assertThat(fee).isEqualByComparingTo(BigDecimal.valueOf(150).setScale(2, RoundingMode.HALF_UP));
    }

    @Test
    @DisplayName("8. Negative duration is rejected with InvalidDurationException")
    void testNegativeDurationRejected() {
        assertThatThrownBy(() -> feeCalculationService.calculateFee(-1))
                .isInstanceOf(InvalidDurationException.class)
                .hasMessageContaining("Duration cannot be negative");
    }

    @Test
    @DisplayName("9. Invalid exit timestamps (exit before entry) are rejected")
    void testInvalidExitTimestampRejected() {
        Instant entry = Instant.parse("2026-10-29T10:00:00Z");
        Instant exitBeforeEntry = Instant.parse("2026-10-29T09:59:59Z");

        assertThatThrownBy(() -> feeCalculationService.calculateFee(entry, exitBeforeEntry))
                .isInstanceOf(InvalidTimestampException.class)
                .hasMessageContaining("cannot be earlier than entry time");
    }

    @Test
    @DisplayName("10. Null timestamps are rejected with InvalidTimestampException")
    void testNullTimestampsRejected() {
        Instant entry = Instant.now();
        assertThatThrownBy(() -> feeCalculationService.calculateFee(null, entry))
                .isInstanceOf(InvalidTimestampException.class);
        assertThatThrownBy(() -> feeCalculationService.calculateFee(entry, null))
                .isInstanceOf(InvalidTimestampException.class);
    }

    @ParameterizedTest(name = "Duration {0}s -> {1} billable blocks")
    @CsvSource({
            "0, 0",
            "1, 1",
            "10800, 1",
            "10801, 2",
            "21600, 2",
            "21601, 3"
    })
    void testBillableBlocksCalculation(long durationSeconds, long expectedBlocks) {
        assertThat(feeCalculationService.calculateBillableBlocks(durationSeconds)).isEqualTo(expectedBlocks);
    }
}
