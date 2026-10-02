package com.its.userservice.controller;

import com.its.userservice.dto.LoginRequest;
import com.its.userservice.dto.LoginResponse;
import com.its.userservice.dto.MessageResponse;
import com.its.userservice.dto.SignUpRequest;
import com.its.userservice.dto.SignUpResponse;
import com.its.userservice.dto.UpdateUserRequest;
import com.its.userservice.dto.UserResponse;
import com.its.userservice.entity.Role;
import com.its.userservice.exception.ApiError;
import com.its.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

/**
 * REST endpoints of the User Service.
 * Every method returns a {@link ResponseEntity} so the HTTP status is explicit.
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Sign up, login and user management")
public class UserController {

    static final String SIGN_UP_SUCCESS_MESSAGE = "Your account is created successfully";
    static final String PROJECT_OWNER_DASHBOARD = "/dashboard/project-owner";
    static final String ASSIGNEE_DASHBOARD = "/dashboard/assignee";

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Sign up - create a new user")
    @ApiResponse(responseCode = "201", description = "User created")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "409", description = "Email already registered",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping
    public ResponseEntity<SignUpResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        UserResponse user = userService.signUp(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{userId}")
                .buildAndExpand(user.userId())
                .toUri();
        String loginUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/users/login")
                .toUriString();

        return ResponseEntity.created(location)
                .body(new SignUpResponse(SIGN_UP_SUCCESS_MESSAGE, loginUrl, user));
    }

    @Operation(summary = "Login with email and password",
            description = "Returns the user and the dashboard to redirect to, based on the user's role.")
    @ApiResponse(responseCode = "200", description = "Login successful")
    @ApiResponse(responseCode = "401", description = "Invalid email or password",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse user = userService.login(request);
        String dashboard = user.role() == Role.PRODUCT_OWNER ? PROJECT_OWNER_DASHBOARD : ASSIGNEE_DASHBOARD;
        return ResponseEntity.ok(new LoginResponse("Login successful", dashboard, user));
    }

    @Operation(summary = "Get all users")
    @ApiResponse(responseCode = "200", description = "List of users")
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @Operation(summary = "Get a user by ID")
    @ApiResponse(responseCode = "200", description = "User found")
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @Operation(summary = "Update a user", description = "Only the fields present in the body are changed.")
    @ApiResponse(responseCode = "200", description = "User updated")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "409", description = "Email already registered",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Integer userId,
                                                   @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(userId, request));
    }

    @Operation(summary = "Delete a user")
    @ApiResponse(responseCode = "200", description = "User deleted")
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @DeleteMapping("/{userId}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Integer userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(new MessageResponse("User with ID " + userId + " deleted successfully"));
    }
}
