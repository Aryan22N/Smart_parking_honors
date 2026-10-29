package com.parking.service.impl;

import com.parking.config.ParkingProperties;
import com.parking.exception.InvalidDurationException;
import com.parking.exception.InvalidTimestampException;
import com.parking.service.FeeCalculationService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;

@Service
public class FeeCalculationServiceImpl implements FeeCalculationService {

    private final ParkingProperties parkingProperties;

    public FeeCalculationServiceImpl(ParkingProperties parkingProperties) {
        this.parkingProperties = parkingProperties;
    }

    @Override
    public BigDecimal calculateFee(long durationSeconds) {
        if (durationSeconds < 0) {
            throw new InvalidDurationException("Duration cannot be negative. Provided: " + durationSeconds + " seconds.");
        }

        // Explicit zero-duration policy: ₹0 when duration is exactly zero
        if (durationSeconds == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        long billableBlocks = calculateBillableBlocks(durationSeconds);
        long ratePerBlock = parkingProperties.getPricing().getBlockRateInr();

        BigDecimal fee = BigDecimal.valueOf(billableBlocks)
                .multiply(BigDecimal.valueOf(ratePerBlock))
                .setScale(2, RoundingMode.HALF_UP);

        return fee;
    }

    @Override
    public BigDecimal calculateFee(Instant entryTime, Instant exitTime) {
        if (entryTime == null) {
            throw new InvalidTimestampException("Entry time cannot be null.");
        }
        if (exitTime == null) {
            throw new InvalidTimestampException("Exit time cannot be null.");
        }
        if (exitTime.isBefore(entryTime)) {
            throw new InvalidTimestampException("Exit time (" + exitTime + ") cannot be earlier than entry time (" + entryTime + ").");
        }

        long durationSeconds = Duration.between(entryTime, exitTime).getSeconds();
        return calculateFee(durationSeconds);
    }

    @Override
    public long calculateBillableBlocks(long durationSeconds) {
        if (durationSeconds <= 0) {
            return 0;
        }

        long blockDuration = parkingProperties.getPricing().getBlockDurationSeconds();
        if (blockDuration <= 0) {
            blockDuration = 10800;
        }

        return (durationSeconds + blockDuration - 1) / blockDuration;
    }

    @Override
    public long calculateDurationSeconds(Instant entryTime, Instant exitTime) {
        if (entryTime == null || exitTime == null) {
            return 0;
        }
        return Math.max(0, Duration.between(entryTime, exitTime).getSeconds());
    }
}
