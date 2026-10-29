package com.parking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public class SlotAvailabilitySummaryResponse {

    @Schema(description = "Total number of parking slots", example = "20")
    private long totalSlots;

    @Schema(description = "Number of currently available slots", example = "15")
    private long availableSlots;

    @Schema(description = "Number of currently occupied slots", example = "5")
    private long occupiedSlots;

    @Schema(description = "Occupancy rate as a percentage (0.0 - 100.0%)", example = "25.0")
    private double occupancyRatePercent;

    public SlotAvailabilitySummaryResponse() {
    }

    public SlotAvailabilitySummaryResponse(long totalSlots, long availableSlots, long occupiedSlots) {
        this.totalSlots = totalSlots;
        this.availableSlots = availableSlots;
        this.occupiedSlots = occupiedSlots;
        this.occupancyRatePercent = totalSlots > 0
                ? Math.round(((double) occupiedSlots / (double) totalSlots) * 1000.0) / 10.0
                : 0.0;
    }

    public long getTotalSlots() {
        return totalSlots;
    }

    public void setTotalSlots(long totalSlots) {
        this.totalSlots = totalSlots;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public void setAvailableSlots(long availableSlots) {
        this.availableSlots = availableSlots;
    }

    public long getOccupiedSlots() {
        return occupiedSlots;
    }

    public void setOccupiedSlots(long occupiedSlots) {
        this.occupiedSlots = occupiedSlots;
    }

    public double getOccupancyRatePercent() {
        return occupancyRatePercent;
    }

    public void setOccupancyRatePercent(double occupancyRatePercent) {
        this.occupancyRatePercent = occupancyRatePercent;
    }
}
