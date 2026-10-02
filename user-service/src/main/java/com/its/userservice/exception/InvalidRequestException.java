package com.its.userservice.exception;

/** Thrown when a request is syntactically valid but breaks a business rule (HTTP 400). */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
