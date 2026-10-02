package com.its.userservice.service.impl;

import com.its.userservice.dto.LoginRequest;
import com.its.userservice.dto.SignUpRequest;
import com.its.userservice.dto.UpdateUserRequest;
import com.its.userservice.dto.UserResponse;
import com.its.userservice.entity.User;
import com.its.userservice.exception.DuplicateResourceException;
import com.its.userservice.exception.InvalidCredentialsException;
import com.its.userservice.exception.InvalidRequestException;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.repository.UserRepository;
import com.its.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Default implementation of {@link UserService}.
 */
@Service
public class UserServiceImpl implements UserService {

    /** Same message for unknown email and wrong password, so callers can't probe which emails exist. */
    private static final String INVALID_CREDENTIALS = "Invalid email or password";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse signUp(SignUpRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("A user with email '" + email + "' already exists");
        }

        User user = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),
                request.role(),
                blankToNull(request.profileImage()));

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS);
        }
        return UserResponse.from(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer userId) {
        return UserResponse.from(findUser(userId));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Integer userId, UpdateUserRequest request) {
        User user = findUser(userId);

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new InvalidRequestException("Name must not be blank");
            }
            user.setName(request.name().trim());
        }

        if (request.email() != null) {
            String newEmail = normalizeEmail(request.email());
            if (newEmail.isEmpty()) {
                throw new InvalidRequestException("Email must not be blank");
            }
            boolean emailChanged = !newEmail.equalsIgnoreCase(user.getEmail());
            if (emailChanged && userRepository.existsByEmailIgnoreCase(newEmail)) {
                throw new DuplicateResourceException("A user with email '" + newEmail + "' already exists");
            }
            user.setEmail(newEmail);
        }

        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        if (request.profileImage() != null) {
            user.setProfile(blankToNull(request.profileImage()));
        }

        if (request.role() != null) {
            user.setRole(request.role());
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Integer userId) {
        User user = findUser(userId);
        userRepository.delete(user);
    }

    // ----------------------------------------------------------------- helpers

    private User findUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found"));
    }

    /** Emails are stored trimmed and lower-case so lookups are consistent. */
    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
