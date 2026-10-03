package com.its.projectservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Request body for creating a project (POST /api/projects).
 */
public record ProjectRequest(

        @Schema(example = "Project Zeta")
        @NotBlank(message = "Project name is required")
        @Size(max = 255, message = "Project name must be at most 255 characters")
        String projectName,

        @Schema(description = "User ID of the product owner", example = "1")
        @NotNull(message = "Product owner ID is required")
        @Positive(message = "Product owner ID must be a positive number")
        Integer productOwner,

        @Schema(description = "Format yyyy-MM-dd", example = "2026-01-01")
        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @Schema(description = "Format yyyy-MM-dd, must not be before the start date", example = "2026-12-31")
        @NotNull(message = "End date is required")
        LocalDate endDate
) {
}
