package com.its.userservice.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error body returned by every endpoint when something goes wrong.
 *
 * <pre>
 * {
 *   "timestamp": "2026-10-02T12:30:00",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "User with ID 99 not found",
 *   "path": "/api/users/99"
 * }
 * </pre>
 * {@code fieldErrors} is only present for validation errors.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, null);
    }

    public static ApiError withFieldErrors(int status, String error, String message, String path,
                                           Map<String, String> fieldErrors) {
        return new ApiError(LocalDateTime.now(), status, error, message, path, fieldErrors);
    }
}
