package com.parking.exception;

import org.springframework.http.HttpStatus;

public class SlotNotFoundException extends BaseParkingException {

    public SlotNotFoundException(Long slotId) {
        super("Parking slot with ID " + slotId + " was not found.", HttpStatus.NOT_FOUND);
    }

    public SlotNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
