package com.its.userservice.dto;

import com.its.userservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Request body for updating a user (PUT /api/users/{userId}).
 * <p>
 * Every field is optional: only the fields that are present (not null)
 * are changed.
 */
public record UpdateUserRequest(

        @Schema(example = "Alice Smith-Jones")
        @Size(max = 255, message = "Name must be at most 255 characters")
        String name,

        @Schema(example = "alice.jones@example.com")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @Schema(example = "newPass789")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String password,

        @Schema(description = "Profile image URL or path", example = "https://example.com/alice-new.png")
        @Size(max = 255, message = "Profile image must be at most 255 characters")
        String profileImage,

        @Schema(description = "productOwner or assignee", example = "assignee")
        Role role
) {
}
