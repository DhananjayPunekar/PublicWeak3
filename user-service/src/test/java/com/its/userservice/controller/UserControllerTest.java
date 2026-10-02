package com.its.userservice.controller;

import com.its.userservice.dto.LoginRequest;
import com.its.userservice.dto.SignUpRequest;
import com.its.userservice.dto.UserResponse;
import com.its.userservice.entity.Role;
import com.its.userservice.exception.InvalidCredentialsException;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for {@link UserController}: request validation,
 * HTTP status codes and JSON shape. The service is mocked.
 */
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private static final UserResponse ALICE =
            new UserResponse(1, "Alice Smith", "alice.smith@example.com", Role.PRODUCT_OWNER, null);

    @Test
    void signUp_returns201WithConfirmationMessageAndLocation() throws Exception {
        when(userService.signUp(any(SignUpRequest.class))).thenReturn(ALICE);

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice Smith","email":"alice.smith@example.com",
                                 "password":"abc123","role":"productOwner"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/users/1"))
                .andExpect(jsonPath("$.message").value("Your account is created successfully"))
                .andExpect(jsonPath("$.loginUrl").value("http://localhost/api/users/login"))
                .andExpect(jsonPath("$.user.role").value("productOwner"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    void signUp_withInvalidFields_returns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"","email":"not-an-email","password":"123","role":"assignee"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());
    }

    @Test
    void signUp_withUnknownRole_returns400() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Alice","email":"alice@example.com","password":"abc123","role":"admin"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Invalid role 'admin'. Allowed values: productOwner, assignee"));
    }

    @Test
    void login_returnsDashboardForRole() throws Exception {
        when(userService.login(any(LoginRequest.class))).thenReturn(ALICE);

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice.smith@example.com","password":"abc123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dashboard").value("/dashboard/project-owner"))
                .andExpect(jsonPath("$.user.userId").value(1));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        when(userService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"alice.smith@example.com","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void getAllUsers_returns200WithList() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(ALICE));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("alice.smith@example.com"));
    }

    @Test
    void getUserById_whenMissing_returns404() throws Exception {
        when(userService.getUserById(99)).thenThrow(new ResourceNotFoundException("User with ID 99 not found"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("User with ID 99 not found"))
                .andExpect(jsonPath("$.path").value("/api/users/99"));
    }

    @Test
    void getUserById_withNonNumericId_returns400() throws Exception {
        mockMvc.perform(get("/api/users/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deleteUser_returns200WithMessage() throws Exception {
        mockMvc.perform(delete("/api/users/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User with ID 5 deleted successfully"));
    }
}
