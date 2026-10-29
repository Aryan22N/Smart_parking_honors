package com.parking.dto.response;

import com.parking.enums.SlotStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public class ParkingSlotResponse {

    @Schema(description = "Slot ID", example = "1")
    private Long id;

    @Schema(description = "Slot identifier number", example = "A-01")
    private String slotNumber;

    @Schema(description = "Current slot status", example = "AVAILABLE")
    private SlotStatus status;

    @Schema(description = "Creation timestamp", example = "2026-10-29T10:00:00Z")
    private Instant createdAt;

    @Schema(description = "Last update timestamp", example = "2026-10-29T10:00:00Z")
    private Instant updatedAt;

    public ParkingSlotResponse() {
    }

    public ParkingSlotResponse(Long id, String slotNumber, SlotStatus status, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public void setStatus(SlotStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
