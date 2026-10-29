package com.parking.exception;

import org.springframework.http.HttpStatus;

public class InvalidTimestampException extends BaseParkingException {

    public InvalidTimestampException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
