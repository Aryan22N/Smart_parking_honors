package com.parking.exception;

import org.springframework.http.HttpStatus;

public class SessionAlreadyCompletedException extends BaseParkingException {

    public SessionAlreadyCompletedException(Long sessionId) {
        super("Parking session with ID " + sessionId + " is already completed.", HttpStatus.CONFLICT);
    }
}
