package com.its.userservice.dto;

/**
 * Response for a successful login.
 *
 * @param message   confirmation message
 * @param dashboard dashboard the client should redirect to, based on the user's role
 * @param user      the logged-in user
 */
public record LoginResponse(
        String message,
        String dashboard,
        UserResponse user
) {
}
