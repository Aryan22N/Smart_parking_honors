package com.parking.service.impl;

import com.parking.config.ParkingProperties;
import com.parking.dto.response.DailyRevenueResponse;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.repository.ParkingSessionRepository;
import com.parking.service.ReportingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
@Transactional(readOnly = true)
public class ReportingServiceImpl implements ReportingService {

    private final ParkingSessionRepository sessionRepository;
    private final ParkingProperties parkingProperties;

    public ReportingServiceImpl(ParkingSessionRepository sessionRepository, ParkingProperties parkingProperties) {
        this.sessionRepository = sessionRepository;
        this.parkingProperties = parkingProperties;
    }

    @Override
    public DailyRevenueResponse getDailyRevenue(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now(parkingProperties.getZoneId());
        ZoneId zoneId = parkingProperties.getZoneId();

        ZonedDateTime startOfDay = targetDate.atStartOfDay(zoneId);
        ZonedDateTime endOfDay = targetDate.plusDays(1).atStartOfDay(zoneId);

        Instant startInstant = startOfDay.toInstant();
        Instant endInstant = endOfDay.toInstant();

        long completedCount = sessionRepository.countCompletedSessionsInPeriod(
                SessionStatus.COMPLETED,
                startInstant,
                endInstant
        );

        BigDecimal totalFinalized = sessionRepository.sumFinalizedRevenueInPeriod(
                SessionStatus.COMPLETED,
                startInstant,
                endInstant
        );

        BigDecimal paidRevenue = sessionRepository.sumPaidRevenueInPeriod(
                SessionStatus.COMPLETED,
                PaymentStatus.PAID,
                startInstant,
                endInstant
        );

        BigDecimal unpaidOutstanding = totalFinalized.subtract(paidRevenue);

        return new DailyRevenueResponse(
                targetDate,
                totalFinalized,
                paidRevenue,
                unpaidOutstanding,
                completedCount
        );
    }
}
