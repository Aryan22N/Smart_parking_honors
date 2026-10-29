package com.parking.exception;

import org.springframework.http.HttpStatus;

public class DuplicateActiveSessionException extends BaseParkingException {

    public DuplicateActiveSessionException(String vehicleNumber) {
        super("Vehicle '" + vehicleNumber + "' already has an active parking session.", HttpStatus.CONFLICT);
    }
}
