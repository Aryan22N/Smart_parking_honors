package com.parking.service;

import com.parking.dto.request.CheckoutRequest;
import com.parking.dto.request.PaymentUpdateRequest;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.response.FareEstimationResponse;
import com.parking.dto.response.InvoiceResponse;
import com.parking.dto.response.PagedResponse;
import com.parking.dto.response.ParkingSessionResponse;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

public interface ParkingSessionService {

    ParkingSessionResponse registerVehicleEntry(VehicleEntryRequest request);

    List<ParkingSessionResponse> getActiveSessions();

    ParkingSessionResponse getActiveSessionById(Long sessionId);

    FareEstimationResponse estimateFare(Long sessionId, Instant atTimestamp);

    InvoiceResponse checkoutVehicle(Long sessionId, CheckoutRequest request);

    InvoiceResponse getSessionInvoice(Long sessionId);

    ParkingSessionResponse updatePaymentStatus(Long sessionId, PaymentUpdateRequest request);

    PagedResponse<ParkingSessionResponse> getParkingHistory(Pageable pageable);
}
