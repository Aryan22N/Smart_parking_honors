package com.parking.controller;

import com.parking.dto.response.ParkingSlotResponse;
import com.parking.dto.response.SlotAvailabilitySummaryResponse;
import com.parking.service.ParkingSlotService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/slots")
@Tag(name = "Parking Slots", description = "Endpoints for checking slot availability, inventory, and status")
public class ParkingSlotController {

    private final ParkingSlotService slotService;

    public ParkingSlotController(ParkingSlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping
    @Operation(summary = "Get all parking slots", description = "Retrieves all parking slots in the facility ordered by slot number.")
    public ResponseEntity<List<ParkingSlotResponse>> getAllSlots() {
        return ResponseEntity.ok(slotService.getAllSlots());
    }

    @GetMapping("/availability")
    @Operation(summary = "Get slot availability summary", description = "Returns total slot count, available slots count, occupied count, and occupancy percentage.")
    public ResponseEntity<SlotAvailabilitySummaryResponse> getAvailabilitySummary() {
        return ResponseEntity.ok(slotService.getAvailabilitySummary());
    }

    @GetMapping("/available")
    @Operation(summary = "List available parking slots", description = "Returns all slots currently marked as AVAILABLE.")
    public ResponseEntity<List<ParkingSlotResponse>> getAvailableSlots() {
        return ResponseEntity.ok(slotService.getAvailableSlots());
    }

    @GetMapping("/occupied")
    @Operation(summary = "List occupied parking slots", description = "Returns all slots currently marked as OCCUPIED.")
    public ResponseEntity<List<ParkingSlotResponse>> getOccupiedSlots() {
        return ResponseEntity.ok(slotService.getOccupiedSlots());
    }

    @GetMapping("/{slotId}")
    @Operation(summary = "Get parking slot details by ID", description = "Returns detailed slot info for a given slot ID.")
    public ResponseEntity<ParkingSlotResponse> getSlotById(
            @Parameter(description = "Numeric ID of the parking slot", example = "1")
            @PathVariable Long slotId) {
        return ResponseEntity.ok(slotService.getSlotById(slotId));
    }
}
