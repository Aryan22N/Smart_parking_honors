package com.parking.exception;

import org.springframework.http.HttpStatus;

public class InvalidPaymentStateException extends BaseParkingException {

    public InvalidPaymentStateException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
