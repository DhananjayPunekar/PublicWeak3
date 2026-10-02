package com.its.userservice.exception;

/** Thrown when creating/updating would duplicate a unique value, e.g. an email (HTTP 409). */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
