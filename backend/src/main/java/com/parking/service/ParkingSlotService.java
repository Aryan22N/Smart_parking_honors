package com.parking.service;

import com.parking.dto.response.ParkingSlotResponse;
import com.parking.dto.response.SlotAvailabilitySummaryResponse;

import java.util.List;

public interface ParkingSlotService {

    List<ParkingSlotResponse> getAllSlots();

    SlotAvailabilitySummaryResponse getAvailabilitySummary();

    List<ParkingSlotResponse> getAvailableSlots();

    List<ParkingSlotResponse> getOccupiedSlots();

    ParkingSlotResponse getSlotById(Long slotId);
}
