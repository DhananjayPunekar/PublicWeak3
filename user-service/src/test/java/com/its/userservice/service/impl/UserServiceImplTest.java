package com.its.userservice.service.impl;

import com.its.userservice.dto.LoginRequest;
import com.its.userservice.dto.SignUpRequest;
import com.its.userservice.dto.UpdateUserRequest;
import com.its.userservice.dto.UserResponse;
import com.its.userservice.entity.Role;
import com.its.userservice.entity.User;
import com.its.userservice.exception.DuplicateResourceException;
import com.its.userservice.exception.InvalidCredentialsException;
import com.its.userservice.exception.InvalidRequestException;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link UserServiceImpl}. The repository is mocked;
 * a real (fast) BCrypt encoder is used so hashing is actually exercised.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    private PasswordEncoder passwordEncoder;
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder(4); // low cost factor keeps tests fast
        userService = new UserServiceImpl(userRepository, passwordEncoder);
    }

    private User existingUser(int id, String email, String rawPassword, Role role) {
        User user = new User("Alice Smith", email, passwordEncoder.encode(rawPassword), role, null);
        user.setUserId(id);
        return user;
    }

    @Test
    void signUp_savesUserWithHashedPasswordAndNormalizedEmail() {
        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setUserId(10);
            return saved;
        });

        UserResponse response = userService.signUp(new SignUpRequest(
                " Alice Smith ", " Alice@Example.com ", "abc123", "", Role.PRODUCT_OWNER));

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();

        assertThat(saved.getEmail()).isEqualTo("alice@example.com");
        assertThat(saved.getName()).isEqualTo("Alice Smith");
        assertThat(saved.getPassword()).isNotEqualTo("abc123");
        assertThat(passwordEncoder.matches("abc123", saved.getPassword())).isTrue();
        assertThat(saved.getProfile()).isNull();

        assertThat(response.userId()).isEqualTo(10);
        assertThat(response.role()).isEqualTo(Role.PRODUCT_OWNER);
    }

    @Test
    void signUp_withExistingEmail_throwsDuplicate() {
        when(userRepository.existsByEmailIgnoreCase("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.signUp(new SignUpRequest(
                "Alice", "alice@example.com", "abc123", null, Role.ASSIGNEE)))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("alice@example.com");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_withCorrectPassword_returnsUser() {
        User user = existingUser(1, "alice@example.com", "abc123", Role.PRODUCT_OWNER);
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));

        UserResponse response = userService.login(new LoginRequest("ALICE@example.com", "abc123"));

        assertThat(response.userId()).isEqualTo(1);
        assertThat(response.role()).isEqualTo(Role.PRODUCT_OWNER);
    }

    @Test
    void login_withWrongPassword_throwsInvalidCredentials() {
        User user = existingUser(1, "alice@example.com", "abc123", Role.PRODUCT_OWNER);
        when(userRepository.findByEmailIgnoreCase("alice@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.login(new LoginRequest("alice@example.com", "wrong")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_withUnknownEmail_throwsInvalidCredentials() {
        when(userRepository.findByEmailIgnoreCase("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(new LoginRequest("nobody@example.com", "abc123")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void getUserById_whenMissing_throwsNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("User with ID 99 not found");
    }

    @Test
    void updateUser_changesOnlyProvidedFields() {
        User user = existingUser(1, "alice@example.com", "abc123", Role.PRODUCT_OWNER);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse response = userService.updateUser(1,
                new UpdateUserRequest("Alice Jones", null, "newPass1", null, Role.ASSIGNEE));

        assertThat(response.name()).isEqualTo("Alice Jones");
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.role()).isEqualTo(Role.ASSIGNEE);
        assertThat(passwordEncoder.matches("newPass1", user.getPassword())).isTrue();
    }

    @Test
    void updateUser_toEmailUsedByAnotherUser_throwsDuplicate() {
        User user = existingUser(1, "alice@example.com", "abc123", Role.PRODUCT_OWNER);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailIgnoreCase("bob@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUser(1,
                new UpdateUserRequest(null, "bob@example.com", null, null, null)))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void updateUser_withBlankName_throwsInvalidRequest() {
        User user = existingUser(1, "alice@example.com", "abc123", Role.PRODUCT_OWNER);
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.updateUser(1,
                new UpdateUserRequest("   ", null, null, null, null)))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void deleteUser_whenMissing_throwsNotFound() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(99))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(userRepository, never()).delete(any());
    }
}
