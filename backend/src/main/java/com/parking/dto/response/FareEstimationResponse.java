package com.parking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;

public class FareEstimationResponse {

    @Schema(description = "Session ID", example = "101")
    private Long sessionId;

    @Schema(description = "Vehicle registration number", example = "KA01AB1234")
    private String vehicleNumber;

    @Schema(description = "Slot number", example = "A-01")
    private String slotNumber;

    @Schema(description = "Session entry timestamp", example = "2026-10-29T10:00:00Z")
    private Instant entryTime;

    @Schema(description = "Timestamp used for estimation", example = "2026-10-29T13:05:00Z")
    private Instant estimatedAt;

    @Schema(description = "Elapsed duration in seconds", example = "11100")
    private long durationSeconds;

    @Schema(description = "Formatted elapsed duration", example = "3h 5m")
    private String durationFormatted;

    @Schema(description = "Number of billable blocks (each started 3-hour period)", example = "2")
    private long billableBlocks;

    @Schema(description = "Rate charged per 3-hour block in INR", example = "50")
    private long ratePerBlockInr;

    @Schema(description = "Estimated fee in INR", example = "100.00")
    private BigDecimal estimatedFee;

    public FareEstimationResponse() {
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
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

    public Instant getEstimatedAt() {
        return estimatedAt;
    }

    public void setEstimatedAt(Instant estimatedAt) {
        this.estimatedAt = estimatedAt;
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

    public long getBillableBlocks() {
        return billableBlocks;
    }

    public void setBillableBlocks(long billableBlocks) {
        this.billableBlocks = billableBlocks;
    }

    public long getRatePerBlockInr() {
        return ratePerBlockInr;
    }

    public void setRatePerBlockInr(long ratePerBlockInr) {
        this.ratePerBlockInr = ratePerBlockInr;
    }

    public BigDecimal getEstimatedFee() {
        return estimatedFee;
    }

    public void setEstimatedFee(BigDecimal estimatedFee) {
        this.estimatedFee = estimatedFee;
    }
}
