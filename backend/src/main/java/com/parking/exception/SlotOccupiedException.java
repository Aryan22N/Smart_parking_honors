package com.parking.exception;

import org.springframework.http.HttpStatus;

public class SlotOccupiedException extends BaseParkingException {

    public SlotOccupiedException(Long slotId) {
        super("The requested parking slot with ID " + slotId + " is already occupied.", HttpStatus.CONFLICT);
    }

    public SlotOccupiedException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
