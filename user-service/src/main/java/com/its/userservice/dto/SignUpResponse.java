package com.its.userservice.dto;

/**
 * Response for a successful sign up: the confirmation message,
 * a link to the login endpoint and the created user.
 */
public record SignUpResponse(
        String message,
        String loginUrl,
        UserResponse user
) {
}
