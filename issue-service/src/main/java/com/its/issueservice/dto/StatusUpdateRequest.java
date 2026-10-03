package com.its.issueservice.dto;

import com.its.issueservice.entity.IssueStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for changing only the status of an issue
 * (PATCH /api/issues/{id}/status) - Assignee view.
 */
public record StatusUpdateRequest(

        @Schema(description = "TO DO, DEVELOPMENT, TESTING or COMPLETED", example = "TESTING")
        @NotNull(message = "Status is required (TO DO, DEVELOPMENT, TESTING or COMPLETED)")
        IssueStatus status
) {
}
