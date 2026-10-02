package com.its.userservice.service;

import com.its.userservice.dto.LoginRequest;
import com.its.userservice.dto.SignUpRequest;
import com.its.userservice.dto.UpdateUserRequest;
import com.its.userservice.dto.UserResponse;

import java.util.List;

/**
 * Business operations for users.
 */
public interface UserService {

    /** Registers a new user. Fails if the email is already in use. */
    UserResponse signUp(SignUpRequest request);

    /** Checks email and password; returns the user if they match. */
    UserResponse login(LoginRequest request);

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Integer userId);

    /** Updates only the fields present in the request. */
    UserResponse updateUser(Integer userId, UpdateUserRequest request);

    void deleteUser(Integer userId);
}
