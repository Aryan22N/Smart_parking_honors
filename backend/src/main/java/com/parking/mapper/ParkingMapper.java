package com.parking.mapper;

import com.parking.dto.response.InvoiceResponse;
import com.parking.dto.response.ParkingSessionResponse;
import com.parking.dto.response.ParkingSlotResponse;
import com.parking.entity.ParkingSession;
import com.parking.entity.ParkingSlot;
import com.parking.enums.SessionStatus;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;

public final class ParkingMapper {

    private ParkingMapper() {
    }

    public static ParkingSlotResponse toSlotResponse(ParkingSlot slot) {
        if (slot == null) return null;
        return new ParkingSlotResponse(
                slot.getId(),
                slot.getSlotNumber(),
                slot.getStatus(),
                slot.getCreatedAt(),
                slot.getUpdatedAt()
        );
    }

    public static ParkingSessionResponse toSessionResponse(ParkingSession session, BigDecimal activeEstimatedFee) {
        if (session == null) return null;

        Instant end = session.getExitTime() != null ? session.getExitTime() : Instant.now();
        long durationSeconds = Math.max(0, Duration.between(session.getEntryTime(), end).getSeconds());
        String formattedDuration = formatDuration(durationSeconds);

        BigDecimal fee = session.getStatus() == SessionStatus.COMPLETED
                ? session.getTotalFee()
                : (activeEstimatedFee != null ? activeEstimatedFee : BigDecimal.ZERO);

        ParkingSessionResponse response = new ParkingSessionResponse();
        response.setId(session.getId());
        response.setVehicleNumber(session.getVehicleNumber());
        response.setSlotId(session.getParkingSlot() != null ? session.getParkingSlot().getId() : null);
        response.setSlotNumber(session.getParkingSlot() != null ? session.getParkingSlot().getSlotNumber() : null);
        response.setEntryTime(session.getEntryTime());
        response.setExitTime(session.getExitTime());
        response.setStatus(session.getStatus());
        response.setDurationSeconds(durationSeconds);
        response.setDurationFormatted(formattedDuration);
        response.setTotalFee(fee);
        response.setPaymentStatus(session.getPaymentStatus());
        response.setCreatedAt(session.getCreatedAt());
        return response;
    }

    public static InvoiceResponse toInvoiceResponse(ParkingSession session) {
        if (session == null) return null;

        Instant exitTime = session.getExitTime() != null ? session.getExitTime() : Instant.now();
        long durationSeconds = Math.max(0, Duration.between(session.getEntryTime(), exitTime).getSeconds());

        InvoiceResponse invoice = new InvoiceResponse();
        invoice.setInvoiceNumber("INV-" + session.getId() + "-" + (session.getExitTime() != null ? session.getExitTime().toEpochMilli() : Instant.now().toEpochMilli()));
        invoice.setSessionId(session.getId());
        invoice.setVehicleNumber(session.getVehicleNumber());
        invoice.setSlotNumber(session.getParkingSlot() != null ? session.getParkingSlot().getSlotNumber() : "UNKNOWN");
        invoice.setEntryTime(session.getEntryTime());
        invoice.setExitTime(session.getExitTime());
        invoice.setDurationSeconds(durationSeconds);
        invoice.setDurationFormatted(formatDuration(durationSeconds));
        invoice.setTotalFee(session.getTotalFee());
        invoice.setPaymentStatus(session.getPaymentStatus());
        invoice.setCurrency("INR");
        invoice.setIssuedAt(Instant.now());
        return invoice;
    }

    public static String formatDuration(long totalSeconds) {
        if (totalSeconds <= 0) return "0m";

        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;

        StringBuilder sb = new StringBuilder();
        if (hours > 0) {
            sb.append(hours).append("h ");
        }
        if (minutes > 0 || hours > 0) {
            sb.append(minutes).append("m");
        } else {
            sb.append(seconds).append("s");
        }
        return sb.toString().trim();
    }
}
