package com.its.projectservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request body for updating a project (PUT /api/projects/{projectId}).
 * <p>
 * Every field is optional: only the fields that are present (not null)
 * are changed.
 */
public record UpdateProjectRequest(

        @Schema(example = "Project Zeta v2")
        @Size(max = 255, message = "Project name must be at most 255 characters")
        String projectName,

        @Schema(description = "User ID of the product owner", example = "4")
        @Positive(message = "Product owner ID must be a positive number")
        Integer productOwner,

        @Schema(description = "Format yyyy-MM-dd", example = "2026-02-01")
        LocalDate startDate,

        @Schema(description = "Format yyyy-MM-dd", example = "2027-01-31")
        LocalDate endDate
) {
}
