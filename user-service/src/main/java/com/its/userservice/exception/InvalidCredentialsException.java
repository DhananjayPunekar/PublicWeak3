package com.its.userservice.exception;

/** Thrown when login fails because the email or password is wrong (HTTP 401). */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
