package com.parking.service;

import java.math.BigDecimal;
import java.time.Instant;

public interface FeeCalculationService {

    BigDecimal calculateFee(long durationSeconds);

    BigDecimal calculateFee(Instant entryTime, Instant exitTime);

    long calculateBillableBlocks(long durationSeconds);

    long calculateDurationSeconds(Instant entryTime, Instant exitTime);
}
