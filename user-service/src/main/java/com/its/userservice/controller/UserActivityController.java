package com.its.userservice.controller;

import com.its.userservice.dto.IssueDto;
import com.its.userservice.dto.ProjectDto;
import com.its.userservice.exception.ApiError;
import com.its.userservice.service.UserActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Inter-service endpoints of the User Service (Milestone 5).
 * The data comes from issue-service (Feign) and project-service (RestTemplate).
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "User issues and projects", description = "Inter-service communication: data from issue-service and project-service")
public class UserActivityController {

    private final UserActivityService userActivityService;

    @Autowired
    public UserActivityController(UserActivityService userActivityService) {
        this.userActivityService = userActivityService;
    }

    @Operation(summary = "Issues assigned to a user, by user ID",
            description = "Inter-service communication: calls issue-service via Feign.")
    @ApiResponse(responseCode = "200", description = "List of issues (empty if none)")
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "503", description = "issue-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{userId}/issues")
    public ResponseEntity<List<IssueDto>> getAssignedIssues(@PathVariable Integer userId) {
        return ResponseEntity.ok(userActivityService.getAssignedIssues(userId));
    }

    @Operation(summary = "Issues assigned to a user, by user name",
            description = "Inter-service communication: calls issue-service via Feign. "
                    + "Case-insensitive; if several users share the name, their issues are combined.")
    @ApiResponse(responseCode = "200", description = "List of issues (empty if none)")
    @ApiResponse(responseCode = "404", description = "No user with that name",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "503", description = "issue-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/username/{username}/issues")
    public ResponseEntity<List<IssueDto>> getAssignedIssuesByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userActivityService.getAssignedIssuesByUsername(username));
    }

    @Operation(summary = "Projects owned by a user",
            description = "Inter-service communication: calls project-service via RestTemplate.")
    @ApiResponse(responseCode = "200", description = "List of projects (empty if none)")
    @ApiResponse(responseCode = "404", description = "User not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "503", description = "project-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{userId}/projects")
    public ResponseEntity<List<ProjectDto>> getOwnedProjects(@PathVariable Integer userId) {
        return ResponseEntity.ok(userActivityService.getOwnedProjects(userId));
    }
}
