package com.its.userservice.exception;

/** Thrown when another microservice can't be reached (HTTP 503). */
public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
