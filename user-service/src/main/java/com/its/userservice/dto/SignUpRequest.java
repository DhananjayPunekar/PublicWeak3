package com.its.userservice.dto;

import com.its.userservice.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for sign up (POST /api/users).
 */
public record SignUpRequest(

        @Schema(example = "Alice Smith")
        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name must be at most 255 characters")
        String name,

        @Schema(example = "alice.smith@example.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @Schema(example = "abc123")
        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        String password,

        @Schema(description = "Profile image URL or path (optional)", example = "https://example.com/alice.png")
        @Size(max = 255, message = "Profile image must be at most 255 characters")
        String profileImage,

        @Schema(description = "productOwner or assignee", example = "productOwner")
        @NotNull(message = "Role is required (productOwner or assignee)")
        Role role
) {
}
