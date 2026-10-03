package com.its.issueservice.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Locale;

/**
 * Kind of issue. Stored by name ('BUG', 'FEATURE', 'TASK').
 */
public enum IssueType {

    BUG,
    FEATURE,
    TASK;

    /**
     * Case-insensitive conversion from JSON ("bug", "Bug", "BUG").
     *
     * @throws IllegalArgumentException if the text is not a valid type
     */
    @JsonCreator
    public static IssueType fromValue(String text) {
        if (text != null) {
            String normalized = text.trim().toUpperCase(Locale.ROOT);
            for (IssueType type : values()) {
                if (type.name().equals(normalized)) {
                    return type;
                }
            }
        }
        throw new IllegalArgumentException("Invalid type '" + text + "'. Allowed values: BUG, FEATURE, TASK");
    }
}
