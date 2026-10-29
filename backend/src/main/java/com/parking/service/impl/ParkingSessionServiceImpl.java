package com.parking.service.impl;

import com.parking.config.ParkingProperties;
import com.parking.dto.request.CheckoutRequest;
import com.parking.dto.request.PaymentUpdateRequest;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.dto.response.FareEstimationResponse;
import com.parking.dto.response.InvoiceResponse;
import com.parking.dto.response.PagedResponse;
import com.parking.dto.response.ParkingSessionResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.enums.PaymentStatus;
import com.parking.enums.SessionStatus;
import com.parking.enums.SlotStatus;
import com.parking.exception.*;
import com.parking.mapper.ParkingMapper;
import com.parking.repository.ParkingSessionRepository;
import com.parking.repository.ParkingSlotRepository;
import com.parking.service.FeeCalculationService;
import com.parking.service.ParkingSessionService;
import com.parking.validation.VehicleNumberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class ParkingSessionServiceImpl implements ParkingSessionService {

    private static final Logger log = LoggerFactory.getLogger(ParkingSessionServiceImpl.class);

    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final FeeCalculationService feeCalculationService;
    private final ParkingProperties parkingProperties;

    public ParkingSessionServiceImpl(ParkingSessionRepository sessionRepository,
                                     ParkingSlotRepository slotRepository,
                                     FeeCalculationService feeCalculationService,
                                     ParkingProperties parkingProperties) {
        this.sessionRepository = sessionRepository;
        this.slotRepository = slotRepository;
        this.feeCalculationService = feeCalculationService;
        this.parkingProperties = parkingProperties;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ParkingSessionResponse registerVehicleEntry(VehicleEntryRequest request) {
        String normalizedVehicle = VehicleNumberUtil.normalize(request.getVehicleNumber());
        log.info("Processing vehicle entry request for vehicle: {} (requested slot: {})", normalizedVehicle, request.getSlotId());

        // 1. Concurrency safe check: Duplicate active session for same vehicle
        if (sessionRepository.existsByVehicleNumberAndStatus(normalizedVehicle, SessionStatus.ACTIVE)) {
            throw new DuplicateActiveSessionException(normalizedVehicle);
        }

        // 2. Concurrency-controlled slot allocation with pessimistic locking
        ParkingSlot selectedSlot;
        if (request.getSlotId() != null) {
            selectedSlot = slotRepository.findByIdForUpdate(request.getSlotId())
                    .orElseThrow(() -> new SlotNotFoundException(request.getSlotId()));

            if (selectedSlot.getStatus() == SlotStatus.OCCUPIED) {
                throw new SlotOccupiedException(request.getSlotId());
            }
        } else {
            List<ParkingSlot> availableSlots = slotRepository.findAvailableSlotsForUpdate(SlotStatus.AVAILABLE);
            if (availableSlots == null || availableSlots.isEmpty()) {
                throw new NoSlotsAvailableException();
            }
            selectedSlot = availableSlots.get(0);
        }

        // 3. Mark slot OCCUPIED
        selectedSlot.setStatus(SlotStatus.OCCUPIED);
        slotRepository.save(selectedSlot);

        // 4. Create and persist active parking session
        ParkingSession session = new ParkingSession(normalizedVehicle, selectedSlot, Instant.now());
        session.setStatus(SessionStatus.ACTIVE);
        session.setPaymentStatus(PaymentStatus.UNPAID);
        session.setTotalFee(BigDecimal.ZERO);

        ParkingSession saved = sessionRepository.save(session);
        log.info("Vehicle {} successfully booked slot {} (session ID: {})", normalizedVehicle, selectedSlot.getSlotNumber(), saved.getId());

        return ParkingMapper.toSessionResponse(saved, BigDecimal.ZERO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParkingSessionResponse> getActiveSessions() {
        return sessionRepository.findByStatusOrderByEntryTimeDesc(SessionStatus.ACTIVE).stream()
                .map(session -> {
                    BigDecimal currentFee = feeCalculationService.calculateFee(session.getEntryTime(), Instant.now());
                    return ParkingMapper.toSessionResponse(session, currentFee);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ParkingSessionResponse getActiveSessionById(Long sessionId) {
        ParkingSession session = sessionRepository.findByIdAndStatus(sessionId, SessionStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Active parking session with ID " + sessionId + " was not found."));

        BigDecimal currentFee = feeCalculationService.calculateFee(session.getEntryTime(), Instant.now());
        return ParkingMapper.toSessionResponse(session, currentFee);
    }

    @Override
    @Transactional(readOnly = true)
    public FareEstimationResponse estimateFare(Long sessionId, Instant atTimestamp) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session with ID " + sessionId + " was not found."));

        Instant calculationTime = atTimestamp != null ? atTimestamp : Instant.now();

        if (calculationTime.isBefore(session.getEntryTime())) {
            throw new InvalidTimestampException("Fare estimation timestamp (" + calculationTime + ") cannot be earlier than session entry time (" + session.getEntryTime() + ").");
        }

        long durationSeconds = Math.max(0, Duration.between(session.getEntryTime(), calculationTime).getSeconds());
        BigDecimal estimatedFee = feeCalculationService.calculateFee(durationSeconds);
        long blocks = feeCalculationService.calculateBillableBlocks(durationSeconds);

        FareEstimationResponse response = new FareEstimationResponse();
        response.setSessionId(session.getId());
        response.setVehicleNumber(session.getVehicleNumber());
        response.setSlotNumber(session.getParkingSlot() != null ? session.getParkingSlot().getSlotNumber() : "N/A");
        response.setEntryTime(session.getEntryTime());
        response.setEstimatedAt(calculationTime);
        response.setDurationSeconds(durationSeconds);
        response.setDurationFormatted(ParkingMapper.formatDuration(durationSeconds));
        response.setBillableBlocks(blocks);
        response.setRatePerBlockInr(parkingProperties.getPricing().getBlockRateInr());
        response.setEstimatedFee(estimatedFee);

        return response;
    }

    @Override
    @Transactional
    public InvoiceResponse checkoutVehicle(Long sessionId, CheckoutRequest request) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session with ID " + sessionId + " was not found."));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new SessionAlreadyCompletedException(sessionId);
        }

        Instant exitTime = (request != null && request.getExitTime() != null) ? request.getExitTime() : Instant.now();

        if (exitTime.isBefore(session.getEntryTime())) {
            throw new InvalidTimestampException("Exit timestamp (" + exitTime + ") cannot be earlier than entry timestamp (" + session.getEntryTime() + ").");
        }

        BigDecimal finalFee = feeCalculationService.calculateFee(session.getEntryTime(), exitTime);

        // Update session state
        session.setExitTime(exitTime);
        session.setTotalFee(finalFee);
        session.setStatus(SessionStatus.COMPLETED);

        if (request != null && request.getMarkAsPaid()) {
            session.setPaymentStatus(PaymentStatus.PAID);
        } else {
            session.setPaymentStatus(PaymentStatus.UNPAID);
        }

        // Free the associated slot within the same transaction
        ParkingSlot slot = session.getParkingSlot();
        if (slot != null) {
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        ParkingSession saved = sessionRepository.save(session);
        log.info("Session {} checked out successfully. Fee: ₹{}, Slot {} released.", sessionId, finalFee, slot != null ? slot.getSlotNumber() : "N/A");

        return ParkingMapper.toInvoiceResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getSessionInvoice(Long sessionId) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session with ID " + sessionId + " was not found."));

        return ParkingMapper.toInvoiceResponse(session);
    }

    @Override
    @Transactional
    public ParkingSessionResponse updatePaymentStatus(Long sessionId, PaymentUpdateRequest request) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session with ID " + sessionId + " was not found."));

        if (session.getStatus() != SessionStatus.COMPLETED) {
            throw new InvalidPaymentStateException("Cannot update payment status for an ACTIVE parking session. Please complete checkout first.");
        }

        if (request.getPaymentStatus() == null) {
            throw new InvalidPaymentStateException("Payment status cannot be null.");
        }

        session.setPaymentStatus(request.getPaymentStatus());
        ParkingSession updated = sessionRepository.save(session);
        log.info("Payment status updated to {} for session ID {}", request.getPaymentStatus(), sessionId);

        return ParkingMapper.toSessionResponse(updated, updated.getTotalFee());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ParkingSessionResponse> getParkingHistory(Pageable pageable) {
        Page<ParkingSession> page = sessionRepository.findByStatusOrderByExitTimeDesc(SessionStatus.COMPLETED, pageable);

        List<ParkingSessionResponse> responses = page.getContent().stream()
                .map(s -> ParkingMapper.toSessionResponse(s, s.getTotalFee()))
                .toList();

        return new PagedResponse<>(
                responses,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
