package com.its.projectservice.dto;

import com.its.projectservice.entity.Project;

import java.time.LocalDate;

/**
 * Project data returned by the API.
 */
public record ProjectResponse(
        Integer id,
        String projectName,
        Integer productOwner,
        LocalDate startDate,
        LocalDate endDate
) {

    /** Builds the response object from the JPA entity. */
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getProjectName(),
                project.getProductOwner(),
                project.getStartDate(),
                project.getEndDate());
    }
}
