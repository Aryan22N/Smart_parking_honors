package com.parking.exception;

import org.springframework.http.HttpStatus;

public class NoSlotsAvailableException extends BaseParkingException {

    public NoSlotsAvailableException() {
        super("No parking slots are currently available. All slots are occupied.", HttpStatus.CONFLICT);
    }
}
