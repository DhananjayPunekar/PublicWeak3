package com.its.userservice.dto;

import java.time.LocalDate;

/**
 * A project as returned by project-service. Used only to receive data from that service.
 */
public record ProjectDto(
        Integer id,
        String projectName,
        Integer productOwner,
        LocalDate startDate,
        LocalDate endDate
) {
}
