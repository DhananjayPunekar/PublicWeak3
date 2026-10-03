package com.its.userservice.dto;

import java.time.LocalDate;

/**
 * An issue as returned by issue-service. Used only to receive data from
 * that service; enum values (type, priority, status) are kept as text.
 */
public record IssueDto(
        Integer id,
        String summary,
        String type,
        Integer project,
        String description,
        String priority,
        Integer assignee,
        Integer createdBy,
        String tags,
        String sprint,
        Integer storyPoint,
        String status,
        LocalDate createdOn,
        LocalDate lastUpdated,
        String comments
) {
}
