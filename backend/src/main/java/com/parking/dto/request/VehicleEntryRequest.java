package com.parking.dto.request;

import com.parking.validation.VehicleNumber;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public class VehicleEntryRequest {

    @NotBlank(message = "Vehicle registration number is required.")
    @VehicleNumber(message = "Invalid vehicle registration number format (e.g. KA01AB1234, DL 01 A 1234, 22BH1234AA).")
    @Schema(description = "Vehicle registration number (Indian format)", example = "KA01AB1234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String vehicleNumber;

    @Schema(description = "Optional specific parking slot ID requested. If omitted, first available slot is assigned.", example = "1")
    private Long slotId;

    public VehicleEntryRequest() {
    }

    public VehicleEntryRequest(String vehicleNumber, Long slotId) {
        this.vehicleNumber = vehicleNumber;
        this.slotId = slotId;
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
}
