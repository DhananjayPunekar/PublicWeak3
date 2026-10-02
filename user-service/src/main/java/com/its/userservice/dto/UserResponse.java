package com.its.userservice.dto;

import com.its.userservice.entity.Role;
import com.its.userservice.entity.User;

/**
 * User data returned by the API. Deliberately has no password field.
 */
public record UserResponse(
        Integer userId,
        String name,
        String email,
        Role role,
        String profileImage
) {

    /** Builds the response object from the JPA entity. */
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getProfile());
    }
}
