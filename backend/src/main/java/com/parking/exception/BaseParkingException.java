package com.parking.exception;

import org.springframework.http.HttpStatus;

public abstract class BaseParkingException extends RuntimeException {

    private final HttpStatus status;

    public BaseParkingException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public BaseParkingException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
