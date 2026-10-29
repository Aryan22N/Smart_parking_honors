package com.parking.exception;

import org.springframework.http.HttpStatus;

public class InvalidDurationException extends BaseParkingException {

    public InvalidDurationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
