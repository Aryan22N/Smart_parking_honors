package com.parking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyRevenueResponse {

    @Schema(description = "Reporting date (ISO YYYY-MM-DD)", example = "2026-10-29")
    private LocalDate date;

    @Schema(description = "Total finalized parking charges for the date", example = "450.00")
    private BigDecimal totalFinalizedCharges;

    @Schema(description = "Revenue collected with PAID status", example = "350.00")
    private BigDecimal paidRevenue;

    @Schema(description = "Unpaid outstanding charges (finalized - paid)", example = "100.00")
    private BigDecimal unpaidOutstandingAmount;

    @Schema(description = "Total number of completed sessions on this date", example = "6")
    private long completedSessionsCount;

    @Schema(description = "Currency", example = "INR")
    private String currency = "INR";

    public DailyRevenueResponse() {
    }

    public DailyRevenueResponse(LocalDate date, BigDecimal totalFinalizedCharges, BigDecimal paidRevenue, BigDecimal unpaidOutstandingAmount, long completedSessionsCount) {
        this.date = date;
        this.totalFinalizedCharges = totalFinalizedCharges != null ? totalFinalizedCharges : BigDecimal.ZERO;
        this.paidRevenue = paidRevenue != null ? paidRevenue : BigDecimal.ZERO;
        this.unpaidOutstandingAmount = unpaidOutstandingAmount != null ? unpaidOutstandingAmount : BigDecimal.ZERO;
        this.completedSessionsCount = completedSessionsCount;
        this.currency = "INR";
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getTotalFinalizedCharges() {
        return totalFinalizedCharges;
    }

    public void setTotalFinalizedCharges(BigDecimal totalFinalizedCharges) {
        this.totalFinalizedCharges = totalFinalizedCharges;
    }

    public BigDecimal getPaidRevenue() {
        return paidRevenue;
    }

    public void setPaidRevenue(BigDecimal paidRevenue) {
        this.paidRevenue = paidRevenue;
    }

    public BigDecimal getUnpaidOutstandingAmount() {
        return unpaidOutstandingAmount;
    }

    public void setUnpaidOutstandingAmount(BigDecimal unpaidOutstandingAmount) {
        this.unpaidOutstandingAmount = unpaidOutstandingAmount;
    }

    public long getCompletedSessionsCount() {
        return completedSessionsCount;
    }

    public void setCompletedSessionsCount(long completedSessionsCount) {
        this.completedSessionsCount = completedSessionsCount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}
