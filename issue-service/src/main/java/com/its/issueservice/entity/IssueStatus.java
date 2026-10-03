package com.its.issueservice.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

/**
 * Workflow status of an issue.
 * <p>
 * The {@code value} is what is stored in the database ENUM column and what
 * appears in JSON ("TO DO", "DEVELOPMENT", "TESTING", "COMPLETED").
 */
public enum IssueStatus {

    TO_DO("TO DO"),
    DEVELOPMENT("DEVELOPMENT"),
    TESTING("TESTING"),
    COMPLETED("COMPLETED");

    private final String value;

    IssueStatus(String value) {
        this.value = value;
    }

    /** Value used in JSON and in the database. */
    @JsonValue
    public String getValue() {
        return value;
    }

    /**
     * Converts text to a status. Case-insensitive; spaces, underscores and
     * hyphens are ignored, so "TO DO", "TO_DO", "to-do" and "todo" all work.
     *
     * @throws IllegalArgumentException if the text is not a valid status
     */
    @JsonCreator
    public static IssueStatus fromValue(String text) {
        if (text != null) {
            String normalized = normalize(text);
            for (IssueStatus status : values()) {
                if (normalize(status.value).equals(normalized)) {
                    return status;
                }
            }
        }
        throw new IllegalArgumentException("Invalid status '" + text + "'. Allowed values: " + allowedValues());
    }

    private static String normalize(String text) {
        return text.replaceAll("[\\s_-]", "").toUpperCase(Locale.ROOT);
    }

    private static String allowedValues() {
        return Arrays.stream(values()).map(IssueStatus::getValue).collect(Collectors.joining(", "));
    }
}
