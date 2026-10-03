package com.its.issueservice.dto;

import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request body for creating an issue (POST /api/issues).
 * <p>
 * {@code type} defaults to TASK, {@code status} to "TO DO" and
 * {@code createdOn} to today. {@code lastUpdated} is always set by the server.
 */
public record IssueRequest(

        @Schema(example = "Login page crashes")
        @NotBlank(message = "Summary is required")
        @Size(max = 255, message = "Summary must be at most 255 characters")
        String summary,

        @Schema(description = "BUG, FEATURE or TASK (default TASK)", example = "BUG")
        IssueType type,

        @Schema(description = "Project ID", example = "101")
        @NotNull(message = "Project ID is required")
        @Positive(message = "Project ID must be a positive number")
        Integer project,

        @Schema(example = "Clicking Login with an empty password shows a stack trace")
        @NotBlank(message = "Description is required")
        String description,

        @Schema(description = "HIGH, MEDIUM or LOW", example = "HIGH")
        @NotNull(message = "Priority is required (HIGH, MEDIUM or LOW)")
        Priority priority,

        @Schema(description = "User ID of the assignee", example = "2")
        @NotNull(message = "Assignee ID is required")
        @Positive(message = "Assignee ID must be a positive number")
        Integer assignee,

        @Schema(description = "User ID of the creator (optional)", example = "1")
        @Positive(message = "Created-by ID must be a positive number")
        Integer createdBy,

        @Schema(example = "Authentication")
        @Size(max = 255, message = "Tags must be at most 255 characters")
        String tags,

        @Schema(example = "Sprint 10")
        @Size(max = 255, message = "Sprint must be at most 255 characters")
        String sprint,

        @Schema(example = "5")
        @PositiveOrZero(message = "Story points must be zero or more")
        Integer storyPoint,

        @Schema(description = "TO DO, DEVELOPMENT, TESTING or COMPLETED (default TO DO)", example = "TO DO")
        IssueStatus status,

        @Schema(description = "Format yyyy-MM-dd (default today, must not be in the future)", example = "2026-10-01")
        @PastOrPresent(message = "Created date must not be in the future")
        LocalDate createdOn,

        @Schema(example = "Reported by the QA team")
        String comments
) {
}
