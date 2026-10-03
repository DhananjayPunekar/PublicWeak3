package com.its.projectservice.dto;

/**
 * Response for a successful project creation: a confirmation message,
 * the new project ID and the full project.
 */
public record ProjectCreatedResponse(
        String message,
        Integer projectId,
        ProjectResponse project
) {
}
