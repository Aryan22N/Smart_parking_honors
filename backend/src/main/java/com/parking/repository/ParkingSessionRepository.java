package com.parking.repository;

import com.parking.entity.ParkingSession;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

    Optional<ParkingSession> findByVehicleNumberAndStatus(String vehicleNumber, SessionStatus status);

    boolean existsByVehicleNumberAndStatus(String vehicleNumber, SessionStatus status);

    List<ParkingSession> findByStatusOrderByEntryTimeDesc(SessionStatus status);

    Optional<ParkingSession> findByIdAndStatus(Long id, SessionStatus status);

    Page<ParkingSession> findByStatusOrderByExitTimeDesc(SessionStatus status, Pageable pageable);

    Page<ParkingSession> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COUNT(s) FROM ParkingSession s WHERE s.status = :status AND s.exitTime >= :start AND s.exitTime < :end")
    long countCompletedSessionsInPeriod(
            @Param("status") SessionStatus status,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT COALESCE(SUM(s.totalFee), 0) FROM ParkingSession s WHERE s.status = :status AND s.exitTime >= :start AND s.exitTime < :end")
    BigDecimal sumFinalizedRevenueInPeriod(
            @Param("status") SessionStatus status,
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("SELECT COALESCE(SUM(s.totalFee), 0) FROM ParkingSession s WHERE s.status = :status AND s.paymentStatus = :paymentStatus AND s.exitTime >= :start AND s.exitTime < :end")
    BigDecimal sumPaidRevenueInPeriod(
            @Param("status") SessionStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
