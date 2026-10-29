package com.parking.repository;

import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    List<ParkingSlot> findByStatusOrderBySlotNumberAsc(SlotStatus status);

    List<ParkingSlot> findAllByOrderBySlotNumberAsc();

    Optional<ParkingSlot> findBySlotNumber(String slotNumber);

    long countByStatus(SlotStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ParkingSlot s WHERE s.id = :id")
    Optional<ParkingSlot> findByIdForUpdate(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query(value = "SELECT s FROM ParkingSlot s WHERE s.status = :status ORDER BY s.id ASC")
    List<ParkingSlot> findAvailableSlotsForUpdate(@Param("status") SlotStatus status);
}
