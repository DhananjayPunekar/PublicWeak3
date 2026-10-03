package com.its.issueservice.controller;

import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.exception.ApiError;
import com.its.issueservice.service.OwnerIssueService;
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
 * Inter-service endpoint of the Issue Service (Milestone 5).
 * The owner's projects come from project-service via Feign.
 */
@RestController
@RequestMapping("/api/issues")
@Tag(name = "Owner issues", description = "Inter-service communication: issues of the projects a user owns")
public class OwnerIssueController {

    private final OwnerIssueService ownerIssueService;

    @Autowired
    public OwnerIssueController(OwnerIssueService ownerIssueService) {
        this.ownerIssueService = ownerIssueService;
    }

    @Operation(summary = "Issues owned by a user (issues of all projects the user owns)",
            description = "Inter-service communication: gets the owner's projects from project-service via Feign.")
    @ApiResponse(responseCode = "200", description = "List of issues (empty if the user owns no projects)")
    @ApiResponse(responseCode = "503", description = "project-service unavailable",
            content = @Content(schema = @Schema(implementation = ApiError.class)))
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<IssueResponse>> getIssuesByOwner(@PathVariable Integer ownerId) {
        return ResponseEntity.ok(ownerIssueService.getIssuesByOwner(ownerId));
    }
}
