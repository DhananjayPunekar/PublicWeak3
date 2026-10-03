package com.its.projectservice.exception;

/** Thrown when creating/updating would duplicate a unique value, e.g. a project name (HTTP 409). */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
