package com.parking.service;

import com.parking.config.ParkingProperties;
import com.parking.dto.request.CheckoutRequest;
import com.parking.dto.request.PaymentUpdateRequest;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.response.FareEstimationResponse;
import com.parking.dto.response.InvoiceResponse;
import com.parking.dto.response.ParkingSessionResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.exception.*;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.service.impl.ParkingSessionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Parking Session Service Unit Tests")
class ParkingSessionServiceTest {

    @Mock
    private ParkingSessionRepository sessionRepository;

    @Mock
    private ParkingSlotRepository slotRepository;

    @Mock
    private FeeCalculationService feeCalculationService;

    private ParkingProperties parkingProperties;

    private ParkingSessionServiceImpl sessionService;

    @BeforeEach
    void setUp() {
        parkingProperties = new ParkingProperties();
        parkingProperties.getPricing().setBlockRateInr(50);
        parkingProperties.getPricing().setBlockDurationSeconds(10800);
        sessionService = new ParkingSessionServiceImpl(sessionRepository, slotRepository, feeCalculationService, parkingProperties);
    }

    @Test
    @DisplayName("Successfully book first available slot when slotId is omitted")
    void testSuccessfulBookingAutoAllocation() {
        VehicleEntryRequest request = new VehicleEntryRequest("KA01AB1234", null);

        ParkingSlot slot = new ParkingSlot("A-01", SlotStatus.AVAILABLE);
        slot.setId(1L);

        when(sessionRepository.existsByVehicleNumberAndStatus("KA01AB1234", SessionStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findAvailableSlotsForUpdate(SlotStatus.AVAILABLE)).thenReturn(List.of(slot));
        when(slotRepository.save(any(ParkingSlot.class))).thenReturn(slot);

        ParkingSession created = new ParkingSession("KA01AB1234", slot, Instant.now());
        created.setId(10L);
        when(sessionRepository.save(any(ParkingSession.class))).thenReturn(created);

        ParkingSessionResponse response = sessionService.registerVehicleEntry(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(10L);
        assertThat(response.getVehicleNumber()).isEqualTo("KA01AB1234");
        assertThat(slot.getStatus()).isEqualTo(SlotStatus.OCCUPIED);
        verify(slotRepository).save(slot);
        verify(sessionRepository).save(any(ParkingSession.class));
    }

    @Test
    @DisplayName("Reject booking when vehicle already has an active session")
    void testDuplicateActiveVehicleRejected() {
        VehicleEntryRequest request = new VehicleEntryRequest("KA01AB1234", null);

        when(sessionRepository.existsByVehicleNumberAndStatus("KA01AB1234", SessionStatus.ACTIVE)).thenReturn(true);

        assertThatThrownBy(() -> sessionService.registerVehicleEntry(request))
                .isInstanceOf(DuplicateActiveSessionException.class)
                .hasMessageContaining("already has an active parking session");

        verifyNoInteractions(slotRepository);
    }

    @Test
    @DisplayName("Reject booking when requested slot ID does not exist")
    void testBookingNonexistentSlotRejected() {
        VehicleEntryRequest request = new VehicleEntryRequest("KA01AB1234", 999L);

        when(sessionRepository.existsByVehicleNumberAndStatus("KA01AB1234", SessionStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.registerVehicleEntry(request))
                .isInstanceOf(SlotNotFoundException.class)
                .hasMessageContaining("not found");
    }

    @Test
    @DisplayName("Reject booking when requested slot is already OCCUPIED")
    void testBookingOccupiedSlotRejected() {
        VehicleEntryRequest request = new VehicleEntryRequest("KA01AB1234", 1L);

        ParkingSlot occupiedSlot = new ParkingSlot("A-01", SlotStatus.OCCUPIED);
        occupiedSlot.setId(1L);

        when(sessionRepository.existsByVehicleNumberAndStatus("KA01AB1234", SessionStatus.ACTIVE)).thenReturn(false);
        when(slotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(occupiedSlot));

        assertThatThrownBy(() -> sessionService.registerVehicleEntry(request))
                .isInstanceOf(SlotOccupiedException.class)
                .hasMessageContaining("already occupied");
    }

    @Test
    @DisplayName("Checkout vehicle: frees slot, finalizes fee, marks COMPLETED")
    void testCheckoutVehicleSuccess() {
        Long sessionId = 10L;
        ParkingSlot slot = new ParkingSlot("A-01", SlotStatus.OCCUPIED);
        slot.setId(1L);

        Instant entryTime = Instant.now().minusSeconds(7200);
        ParkingSession session = new ParkingSession("KA01AB1234", slot, entryTime);
        session.setId(sessionId);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(feeCalculationService.calculateFee(eq(entryTime), any(Instant.class))).thenReturn(BigDecimal.valueOf(50.00));
        when(sessionRepository.save(any(ParkingSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CheckoutRequest request = new CheckoutRequest(null, true);
        InvoiceResponse invoice = sessionService.checkoutVehicle(sessionId, request);

        assertThat(invoice).isNotNull();
        assertThat(invoice.getSessionId()).isEqualTo(sessionId);
        assertThat(invoice.getTotalFee()).isEqualByComparingTo(BigDecimal.valueOf(50.00));
        assertThat(invoice.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(slot.getStatus()).isEqualTo(SlotStatus.AVAILABLE);
        assertThat(session.getStatus()).isEqualTo(SessionStatus.COMPLETED);

        verify(slotRepository).save(slot);
        verify(sessionRepository).save(session);
    }

    @Test
    @DisplayName("Checkout rejects already COMPLETED session with Conflict")
    void testCheckoutAlreadyCompletedSessionRejected() {
        Long sessionId = 10L;
        ParkingSlot slot = new ParkingSlot("A-01", SlotStatus.AVAILABLE);
        ParkingSession session = new ParkingSession("KA01AB1234", slot, Instant.now().minusSeconds(10000));
        session.setId(sessionId);
        session.setStatus(SessionStatus.COMPLETED);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThatThrownBy(() -> sessionService.checkoutVehicle(sessionId, new CheckoutRequest()))
                .isInstanceOf(SessionAlreadyCompletedException.class)
                .hasMessageContaining("already completed");
    }

    @Test
    @DisplayName("Payment update fails on active session")
    void testPaymentUpdateOnActiveSessionFails() {
        Long sessionId = 10L;
        ParkingSlot slot = new ParkingSlot("A-01", SlotStatus.OCCUPIED);
        ParkingSession session = new ParkingSession("KA01AB1234", slot, Instant.now());
        session.setId(sessionId);
        session.setStatus(SessionStatus.ACTIVE);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        PaymentUpdateRequest updateRequest = new PaymentUpdateRequest(PaymentStatus.PAID);
        assertThatThrownBy(() -> sessionService.updatePaymentStatus(sessionId, updateRequest))
                .isInstanceOf(InvalidPaymentStateException.class)
                .hasMessageContaining("Cannot update payment status for an ACTIVE parking session");
    }

    @Test
    @DisplayName("Estimate fare returns accurate billable blocks and fee")
    void testEstimateFare() {
        Long sessionId = 10L;
        ParkingSlot slot = new ParkingSlot("A-01", SlotStatus.OCCUPIED);
        Instant entryTime = Instant.parse("2026-10-29T10:00:00Z");
        Instant estimationTime = Instant.parse("2026-10-29T13:05:00Z"); // 3h 5m -> 2 blocks

        ParkingSession session = new ParkingSession("KA01AB1234", slot, entryTime);
        session.setId(sessionId);

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(feeCalculationService.calculateFee(11100L)).thenReturn(BigDecimal.valueOf(100.00));
        when(feeCalculationService.calculateBillableBlocks(11100L)).thenReturn(2L);

        FareEstimationResponse response = sessionService.estimateFare(sessionId, estimationTime);

        assertThat(response).isNotNull();
        assertThat(response.getSessionId()).isEqualTo(sessionId);
        assertThat(response.getBillableBlocks()).isEqualTo(2L);
        assertThat(response.getEstimatedFee()).isEqualByComparingTo(BigDecimal.valueOf(100.00));
    }
}
