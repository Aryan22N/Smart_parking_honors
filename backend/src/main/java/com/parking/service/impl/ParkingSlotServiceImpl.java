package com.parking.service.impl;

import com.parking.dto.response.ParkingSlotResponse;
import com.parking.dto.response.SlotAvailabilitySummaryResponse;
import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import com.parking.exception.SlotNotFoundException;
import com.parking.mapper.ParkingMapper;
import com.parking.repository.ParkingSlotRepository;
import com.parking.service.ParkingSlotService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ParkingSlotServiceImpl implements ParkingSlotService {

    private final ParkingSlotRepository slotRepository;

    public ParkingSlotServiceImpl(ParkingSlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    @Override
    public List<ParkingSlotResponse> getAllSlots() {
        return slotRepository.findAllByOrderBySlotNumberAsc().stream()
                .map(ParkingMapper::toSlotResponse)
                .toList();
    }

    @Override
    public SlotAvailabilitySummaryResponse getAvailabilitySummary() {
        long total = slotRepository.count();
        long available = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupied = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        return new SlotAvailabilitySummaryResponse(total, available, occupied);
    }

    @Override
    public List<ParkingSlotResponse> getAvailableSlots() {
        return slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.AVAILABLE).stream()
                .map(ParkingMapper::toSlotResponse)
                .toList();
    }

    @Override
    public List<ParkingSlotResponse> getOccupiedSlots() {
        return slotRepository.findByStatusOrderBySlotNumberAsc(SlotStatus.OCCUPIED).stream()
                .map(ParkingMapper::toSlotResponse)
                .toList();
    }

    @Override
    public ParkingSlotResponse getSlotById(Long slotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException(slotId));
        return ParkingMapper.toSlotResponse(slot);
    }
}
