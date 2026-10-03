package com.its.projectservice.dto;

/**
 * Simple response carrying only a status message (e.g. after a delete).
 */
public record MessageResponse(String message) {
}
