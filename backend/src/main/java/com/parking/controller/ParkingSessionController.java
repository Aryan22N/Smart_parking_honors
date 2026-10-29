package com.parking.controller;

import com.parking.dto.request.CheckoutRequest;
import com.parking.dto.request.PaymentUpdateRequest;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.response.FareEstimationResponse;
import com.parking.dto.response.InvoiceResponse;
import com.parking.dto.response.PagedResponse;
import com.parking.dto.response.ParkingSessionResponse;
import com.parking.service.ParkingSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sessions")
@Tag(name = "Parking Sessions", description = "Endpoints for vehicle entry, active session tracking, checkout, invoicing, and payment")
public class ParkingSessionController {

    private final ParkingSessionService sessionService;

    public ParkingSessionController(ParkingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/entry")
    @Operation(summary = "Register vehicle entry and allocate slot", description = "Books a parking slot for a vehicle. Concurrency protected. Returns 201 Created.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Slot successfully booked"),
            @ApiResponse(responseCode = "400", description = "Invalid vehicle number or input format"),
            @ApiResponse(responseCode = "404", description = "Requested slot ID does not exist"),
            @ApiResponse(responseCode = "409", description = "Requested slot is occupied or vehicle already has an active session")
    })
    public ResponseEntity<ParkingSessionResponse> registerVehicleEntry(
            @Valid @RequestBody VehicleEntryRequest request) {
        ParkingSessionResponse response = sessionService.registerVehicleEntry(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/active")
    @Operation(summary = "List all active parking sessions", description = "Returns all currently parked vehicles with live elapsed duration and estimated fees.")
    public ResponseEntity<List<ParkingSessionResponse>> getActiveSessions() {
        return ResponseEntity.ok(sessionService.getActiveSessions());
    }

    @GetMapping("/active/{sessionId}")
    @Operation(summary = "Get single active parking session by ID", description = "Returns active session details with current live fee estimate.")
    public ResponseEntity<ParkingSessionResponse> getActiveSessionById(
            @Parameter(description = "Parking session ID", example = "1")
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getActiveSessionById(sessionId));
    }

    @GetMapping("/{sessionId}/fare")
    @Operation(summary = "Estimate fare for a parking session", description = "Calculates parking fee for an active session at current server time or specified timestamp.")
    public ResponseEntity<FareEstimationResponse> estimateFare(
            @Parameter(description = "Parking session ID", example = "1")
            @PathVariable Long sessionId,
            @Parameter(description = "Optional timestamp (ISO-8601 UTC) at which to estimate fare", example = "2026-10-29T14:00:00Z")
            @RequestParam(name = "at", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant atTimestamp) {
        return ResponseEntity.ok(sessionService.estimateFare(sessionId, atTimestamp));
    }

    @PostMapping("/{sessionId}/checkout")
    @Operation(summary = "Checkout vehicle and finalize billing", description = "Completes the parking session, marks slot AVAILABLE, finalizes total fee, and returns invoice.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Vehicle successfully checked out"),
            @ApiResponse(responseCode = "404", description = "Session ID not found"),
            @ApiResponse(responseCode = "409", description = "Session is already completed")
    })
    public ResponseEntity<InvoiceResponse> checkoutVehicle(
            @Parameter(description = "Parking session ID", example = "1")
            @PathVariable Long sessionId,
            @RequestBody(required = false) CheckoutRequest request) {
        return ResponseEntity.ok(sessionService.checkoutVehicle(sessionId, request));
    }

    @GetMapping("/{sessionId}/invoice")
    @Operation(summary = "Retrieve invoice for a session", description = "Returns finalized invoice details for a session.")
    public ResponseEntity<InvoiceResponse> getSessionInvoice(
            @Parameter(description = "Parking session ID", example = "1")
            @PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionInvoice(sessionId));
    }

    @PatchMapping("/{sessionId}/payment")
    @Operation(summary = "Update payment status for a completed session", description = "Marks payment as PAID for a completed session.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment status updated successfully"),
            @ApiResponse(responseCode = "400", description = "Session is still ACTIVE or invalid status transition"),
            @ApiResponse(responseCode = "404", description = "Session ID not found")
    })
    public ResponseEntity<ParkingSessionResponse> updatePaymentStatus(
            @Parameter(description = "Parking session ID", example = "1")
            @PathVariable Long sessionId,
            @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(sessionService.updatePaymentStatus(sessionId, request));
    }

    @GetMapping("/history")
    @Operation(summary = "List completed parking session history", description = "Returns paginated list of completed parking sessions ordered by checkout time descending.")
    public ResponseEntity<PagedResponse<ParkingSessionResponse>> getParkingHistory(
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(name = "page", defaultValue = "0") int page,
            @Parameter(description = "Page size (1-100)", example = "10")
            @RequestParam(name = "size", defaultValue = "10") int size,
            @Parameter(description = "Sort direction (asc/desc)", example = "desc")
            @RequestParam(name = "direction", defaultValue = "desc") String direction) {
        int validatedPage = Math.max(0, page);
        int validatedSize = Math.min(100, Math.max(1, size));
        Sort sort = "asc".equalsIgnoreCase(direction)
                ? Sort.by("exitTime").ascending()
                : Sort.by("exitTime").descending();

        Pageable pageable = PageRequest.of(validatedPage, validatedSize, sort);
        return ResponseEntity.ok(sessionService.getParkingHistory(pageable));
    }
}
