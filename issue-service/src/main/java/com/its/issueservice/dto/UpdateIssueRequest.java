package com.its.issueservice.dto;

import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Request body for updating an issue (PUT /api/issues/{id}) - Project Owner view.
 * <p>
 * Every field is optional: only the fields that are present (not null)
 * are changed. {@code lastUpdated} is set to today automatically.
 */
public record UpdateIssueRequest(

        @Schema(example = "Login page crashes on empty password")
        @Size(max = 255, message = "Summary must be at most 255 characters")
        String summary,

        @Schema(description = "BUG, FEATURE or TASK", example = "BUG")
        IssueType type,

        @Schema(description = "Move the issue to another project", example = "102")
        @Positive(message = "Project ID must be a positive number")
        Integer project,

        @Schema(example = "Updated description")
        String description,

        @Schema(description = "HIGH, MEDIUM or LOW", example = "MEDIUM")
        Priority priority,

        @Schema(description = "User ID of the new assignee", example = "3")
        @Positive(message = "Assignee ID must be a positive number")
        Integer assignee,

        @Schema(example = "Authentication, UI")
        @Size(max = 255, message = "Tags must be at most 255 characters")
        String tags,

        @Schema(example = "Sprint 11")
        @Size(max = 255, message = "Sprint must be at most 255 characters")
        String sprint,

        @Schema(example = "8")
        @PositiveOrZero(message = "Story points must be zero or more")
        Integer storyPoint,

        @Schema(description = "TO DO, DEVELOPMENT, TESTING or COMPLETED", example = "DEVELOPMENT")
        IssueStatus status,

        @Schema(example = "Moved to sprint 11")
        String comments
) {
}
