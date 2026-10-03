package com.its.projectservice.controller;

import com.its.projectservice.dto.IssueDto;
import com.its.projectservice.exception.ApiError;
import com.its.projectservice.service.ProjectIssueService;
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
 * Inter-service endpoints of the Project Service (Milestone 5).
 * The issues come from issue-service via Feign.
 */
@RestController
@RequestMapping("/api/projects")
@Tag(name = "Project issues", description = "Inter-service communication: issues of a project from issue-service")
public class ProjectIssueController {

    private final ProjectIssueService projectIssueService;

    @Autowired
    public ProjectIssueController(ProjectIssueService projectIssueService) {
        this.projectIssueService = projectIssueService;
    }

    @Operation(summary = "Issues of a project, by project ID",
            description = "Inter-service communication: calls issue-service via Feign.")
    @ApiResponse(responseCode = "200", description = "List of issues (empty if none)")
    @ApiResponse(responseCode = "404", description = "Project not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "503", description = "issue-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{projectId}/issues")
    public ResponseEntity<List<IssueDto>> getIssuesByProjectId(@PathVariable Integer projectId) {
        return ResponseEntity.ok(projectIssueService.getIssuesByProjectId(projectId));
    }

    @Operation(summary = "Issues of a project, by project name",
            description = "Inter-service communication: calls issue-service via Feign. Name is case-insensitive.")
    @ApiResponse(responseCode = "200", description = "List of issues (empty if none)")
    @ApiResponse(responseCode = "404", description = "No project with that name",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "503", description = "issue-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/projectName/{projectName}/issues")
    public ResponseEntity<List<IssueDto>> getIssuesByProjectName(@PathVariable String projectName) {
        return ResponseEntity.ok(projectIssueService.getIssuesByProjectName(projectName));
    }
}
