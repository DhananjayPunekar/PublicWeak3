package com.its.issueservice.controller;

import com.its.issueservice.dto.IssueCreatedResponse;
import com.its.issueservice.dto.IssueRequest;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.MessageResponse;
import com.its.issueservice.dto.StatusUpdateRequest;
import com.its.issueservice.dto.UpdateIssueRequest;
import com.its.issueservice.exception.ApiError;
import com.its.issueservice.service.IssueService;
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
import org.springframework.web.bind.annotation.PatchMapping;
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
 * REST endpoints for issues.
 * Every method returns a {@link ResponseEntity} so the HTTP status is explicit.
 */
@RestController
@RequestMapping("/api/issues")
@Tag(name = "Issues", description = "Issue creation, retrieval and updates (Project Owner and Assignee views)")
public class IssueController {

    static final String CREATED_MESSAGE = "Issue created successfully";

    private final IssueService issueService;

    @Autowired
    public IssueController(IssueService issueService) {
        this.issueService = issueService;
    }

    @Operation(summary = "Create a new issue (Project Owner view)",
            description = "type defaults to TASK, status to \"TO DO\" and createdOn to today.")
    @ApiResponse(responseCode = "201", description = "Issue created")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PostMapping
    public ResponseEntity<IssueCreatedResponse> createIssue(@Valid @RequestBody IssueRequest request) {
        IssueResponse issue = issueService.createIssue(request);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(issue.id())
                .toUri();

        return ResponseEntity.created(location)
                .body(new IssueCreatedResponse(CREATED_MESSAGE, issue.id(), issue));
    }

    @Operation(summary = "Get all issues")
    @ApiResponse(responseCode = "200", description = "List of issues")
    @GetMapping
    public ResponseEntity<List<IssueResponse>> getAllIssues() {
        return ResponseEntity.ok(issueService.getAllIssues());
    }

    @Operation(summary = "Get an issue by ID (Project Owner / Assignee view)")
    @ApiResponse(responseCode = "200", description = "Issue found")
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssueById(@PathVariable Integer id) {
        return ResponseEntity.ok(issueService.getIssueById(id));
    }

    @Operation(summary = "Get issues of a project",
            description = "Returns an empty list if the project has no issues. Also used by project-service.")
    @ApiResponse(responseCode = "200", description = "List of issues")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByProject(@PathVariable Integer projectId) {
        return ResponseEntity.ok(issueService.getIssuesByProject(projectId));
    }

    @Operation(summary = "Get issues assigned to a user (Assignee view)",
            description = "Returns an empty list if nothing is assigned. Also used by user-service.")
    @ApiResponse(responseCode = "200", description = "List of issues")
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByAssignee(@PathVariable Integer assigneeId) {
        return ResponseEntity.ok(issueService.getIssuesByAssignee(assigneeId));
    }

    @Operation(summary = "Update an issue (Project Owner view)",
            description = "Only the fields present in the body are changed; lastUpdated is set to today.")
    @ApiResponse(responseCode = "200", description = "Issue updated")
    @ApiResponse(responseCode = "400", description = "Invalid input",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(@PathVariable Integer id,
                                                     @Valid @RequestBody UpdateIssueRequest request) {
        return ResponseEntity.ok(issueService.updateIssue(id, request));
    }

    @Operation(summary = "Update only the status of an issue (Assignee view)")
    @ApiResponse(responseCode = "200", description = "Status updated")
    @ApiResponse(responseCode = "400", description = "Missing or unknown status",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @PatchMapping("/{id}/status")
    public ResponseEntity<IssueResponse> updateStatus(@PathVariable Integer id,
                                                      @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(issueService.updateStatus(id, request.status()));
    }

    @Operation(summary = "Delete an issue")
    @ApiResponse(responseCode = "200", description = "Issue deleted")
    @ApiResponse(responseCode = "404", description = "Issue not found",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteIssue(@PathVariable Integer id) {
        issueService.deleteIssue(id);
        return ResponseEntity.ok(new MessageResponse("Issue with ID " + id + " deleted successfully"));
    }
}
