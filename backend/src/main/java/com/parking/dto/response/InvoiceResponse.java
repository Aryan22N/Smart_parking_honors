package com.parking.dto.response;

import com.parking.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.Instant;

public class InvoiceResponse {

    @Schema(description = "Invoice unique reference", example = "INV-20261029-00101")
    private String invoiceNumber;

    @Schema(description = "Parking session ID", example = "101")
    private Long sessionId;

    @Schema(description = "Vehicle registration number", example = "KA01AB1234")
    private String vehicleNumber;

    @Schema(description = "Assigned parking slot number", example = "A-01")
    private String slotNumber;

    @Schema(description = "Entry timestamp", example = "2026-10-29T10:00:00Z")
    private Instant entryTime;

    @Schema(description = "Exit timestamp", example = "2026-10-29T13:05:00Z")
    private Instant exitTime;

    @Schema(description = "Total duration in seconds", example = "11100")
    private long durationSeconds;

    @Schema(description = "Formatted duration", example = "3h 5m")
    private String durationFormatted;

    @Schema(description = "Finalized fee in INR", example = "100.00")
    private BigDecimal totalFee;

    @Schema(description = "Payment status", example = "PAID")
    private PaymentStatus paymentStatus;

    @Schema(description = "Currency", example = "INR")
    private String currency = "INR";

    @Schema(description = "Invoice generation timestamp", example = "2026-10-29T13:05:00Z")
    private Instant issuedAt;

    public InvoiceResponse() {
        this.issuedAt = Instant.now();
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
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

    public Instant getExitTime() {
        return exitTime;
    }

    public void setExitTime(Instant exitTime) {
        this.exitTime = exitTime;
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

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(Instant issuedAt) {
        this.issuedAt = issuedAt;
    }
}
