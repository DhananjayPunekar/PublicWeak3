package com.its.userservice.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

/**
 * Role of a user in the Issue Tracking System.
 * <p>
 * The {@code value} is what is stored in the database ENUM column and what
 * appears in JSON requests/responses ("productOwner" / "assignee").
 */
public enum Role {

    PRODUCT_OWNER("productOwner"),
    ASSIGNEE("assignee");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    /** Value used in JSON and in the database. */
    @JsonValue
    public String getValue() {
        return value;
    }

    /**
     * Converts text to a Role. Accepts "productOwner", "PRODUCT_OWNER",
     * "product owner", "assignee", ... (case-insensitive, ignoring _ and spaces).
     *
     * @throws IllegalArgumentException if the text is not a valid role
     */
    @JsonCreator
    public static Role fromValue(String text) {
        if (text != null) {
            String normalized = text.replace("_", "").replace(" ", "").toLowerCase(Locale.ROOT);
            for (Role role : values()) {
                if (role.value.toLowerCase(Locale.ROOT).equals(normalized)) {
                    return role;
                }
            }
        }
        throw new IllegalArgumentException(
                "Invalid role '" + text + "'. Allowed values: productOwner, assignee");
    }
}
