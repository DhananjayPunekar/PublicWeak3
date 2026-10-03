package com.its.issueservice.dto;

import com.its.issueservice.entity.Issue;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;

import java.time.LocalDate;

/**
 * Issue data returned by the API.
 */
public record IssueResponse(
        Integer id,
        String summary,
        IssueType type,
        Integer project,
        String description,
        Priority priority,
        Integer assignee,
        Integer createdBy,
        String tags,
        String sprint,
        Integer storyPoint,
        IssueStatus status,
        LocalDate createdOn,
        LocalDate lastUpdated,
        String comments
) {

    /** Builds the response object from the JPA entity. */
    public static IssueResponse from(Issue issue) {
        return new IssueResponse(
                issue.getId(),
                issue.getSummary(),
                issue.getType(),
                issue.getProject(),
                issue.getDescription(),
                issue.getPriority(),
                issue.getAssignee(),
                issue.getCreatedBy(),
                issue.getTags(),
                issue.getSprint(),
                issue.getStoryPoint(),
                issue.getStatus(),
                issue.getCreatedOn(),
                issue.getLastUpdated(),
                issue.getComments());
    }
}
