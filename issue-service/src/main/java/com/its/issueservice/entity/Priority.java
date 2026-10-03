package com.its.issueservice.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Locale;

/**
 * Priority level of an issue. Stored by name ('HIGH', 'MEDIUM', 'LOW').
 */
public enum Priority {

    HIGH,
    MEDIUM,
    LOW;

    /**
     * Case-insensitive conversion from JSON ("high", "High", "HIGH").
     *
     * @throws IllegalArgumentException if the text is not a valid priority
     */
    @JsonCreator
    public static Priority fromValue(String text) {
        if (text != null) {
            String normalized = text.trim().toUpperCase(Locale.ROOT);
            for (Priority priority : values()) {
                if (priority.name().equals(normalized)) {
                    return priority;
                }
            }
        }
        throw new IllegalArgumentException("Invalid priority '" + text + "'. Allowed values: HIGH, MEDIUM, LOW");
    }
}
