package com.its.userservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body for login (POST /api/users/login).
 */
public record LoginRequest(

        @Schema(example = "alice.smith@example.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid email address")
        String email,

        @Schema(example = "abc123")
        @NotBlank(message = "Password is required")
        String password
) {
}
