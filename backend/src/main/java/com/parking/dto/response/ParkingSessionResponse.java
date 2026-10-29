package com.parking.dto.response;

import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;

public class ParkingSessionResponse {

    @Schema(description = "Session ID", example = "101")
    private Long id;

    @Schema(description = "Vehicle registration number", example = "KA01AB1234")
    private String vehicleNumber;

    @Schema(description = "Assigned parking slot ID", example = "1")
    private Long slotId;

    @Schema(description = "Assigned parking slot number", example = "A-01")
    private String slotNumber;

    @Schema(description = "Entry timestamp", example = "2026-10-29T10:00:00Z")
    private Instant entryTime;

    @Schema(description = "Exit timestamp (null if still active)", example = "2026-10-29T12:30:00Z")
    private Instant exitTime;

    @Schema(description = "Session status", example = "ACTIVE")
    private SessionStatus status;

    @Schema(description = "Elapsed or total duration in seconds", example = "9000")
    private long durationSeconds;

    @Schema(description = "Formatted duration string", example = "2h 30m")
    private String durationFormatted;

    @Schema(description = "Estimated or finalized total fee in INR", example = "50.00")
    private BigDecimal totalFee;

    @Schema(description = "Payment status", example = "UNPAID")
    private PaymentStatus paymentStatus;

    @Schema(description = "Session creation timestamp", example = "2026-10-29T10:00:00Z")
    private Instant createdAt;

    public ParkingSessionResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public Long getSlotId() {
        return slotId;
    }

    public void setSlotId(Long slotId) {
        this.slotId = slotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public Instant getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(Instant entryTime) {
        this.entryTime = entryTime;
    }

    public Instant getExitTime() {
        return exitTime;
    }

    public void setExitTime(Instant exitTime) {
        this.exitTime = exitTime;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public long getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getDurationFormatted() {
        return durationFormatted;
    }

    public void setDurationFormatted(String durationFormatted) {
        this.durationFormatted = durationFormatted;
    }

    public BigDecimal getTotalFee() {
        return totalFee;
    }

    public void setTotalFee(BigDecimal totalFee) {
        this.totalFee = totalFee;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
