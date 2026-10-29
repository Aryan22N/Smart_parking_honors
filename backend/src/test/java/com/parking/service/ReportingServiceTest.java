package com.parking.service;

import com.parking.config.ParkingProperties;
import com.parking.dto.response.DailyRevenueResponse;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.repository.ParkingSessionRepository;
import com.parking.service.impl.ReportingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Reporting Service Unit Tests")
class ReportingServiceTest {

    @Mock
    private ParkingSessionRepository sessionRepository;

    private ParkingProperties parkingProperties;
    private ReportingServiceImpl reportingService;

    @BeforeEach
    void setUp() {
        parkingProperties = new ParkingProperties();
        parkingProperties.setTimezone("Asia/Kolkata");
        reportingService = new ReportingServiceImpl(sessionRepository, parkingProperties);
    }

    @Test
    @DisplayName("Aggregates daily revenue accurately from completed sessions")
    void testDailyRevenueAggregation() {
        LocalDate date = LocalDate.of(2026, 10, 29);

        when(sessionRepository.countCompletedSessionsInPeriod(eq(SessionStatus.COMPLETED), any(Instant.class), any(Instant.class)))
                .thenReturn(5L);
        when(sessionRepository.sumFinalizedRevenueInPeriod(eq(SessionStatus.COMPLETED), any(Instant.class), any(Instant.class)))
                .thenReturn(BigDecimal.valueOf(500.00));
        when(sessionRepository.sumPaidRevenueInPeriod(eq(SessionStatus.COMPLETED), eq(PaymentStatus.PAID), any(Instant.class), any(Instant.class)))
                .thenReturn(BigDecimal.valueOf(350.00));

        DailyRevenueResponse response = reportingService.getDailyRevenue(date);

        assertThat(response).isNotNull();
        assertThat(response.getDate()).isEqualTo(date);
        assertThat(response.getCompletedSessionsCount()).isEqualTo(5L);
        assertThat(response.getTotalFinalizedCharges()).isEqualByComparingTo(BigDecimal.valueOf(500.00));
        assertThat(response.getPaidRevenue()).isEqualByComparingTo(BigDecimal.valueOf(350.00));
        assertThat(response.getUnpaidOutstandingAmount()).isEqualByComparingTo(BigDecimal.valueOf(150.00));
        assertThat(response.getCurrency()).isEqualTo("INR");
    }

    @Test
    @DisplayName("Returns zero totals for dates with no completed sessions")
    void testDailyRevenueWithZeroSessions() {
        LocalDate date = LocalDate.of(2026, 1, 1);

        when(sessionRepository.countCompletedSessionsInPeriod(eq(SessionStatus.COMPLETED), any(Instant.class), any(Instant.class)))
                .thenReturn(0L);
        when(sessionRepository.sumFinalizedRevenueInPeriod(eq(SessionStatus.COMPLETED), any(Instant.class), any(Instant.class)))
                .thenReturn(BigDecimal.ZERO);
        when(sessionRepository.sumPaidRevenueInPeriod(eq(SessionStatus.COMPLETED), eq(PaymentStatus.PAID), any(Instant.class), any(Instant.class)))
                .thenReturn(BigDecimal.ZERO);

        DailyRevenueResponse response = reportingService.getDailyRevenue(date);

        assertThat(response).isNotNull();
        assertThat(response.getCompletedSessionsCount()).isEqualTo(0L);
        assertThat(response.getTotalFinalizedCharges()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getPaidRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getUnpaidOutstandingAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
