package com.its.issueservice.dto;

/**
 * Response for a successful issue creation: a confirmation message,
 * the new issue ID and the full issue.
 */
public record IssueCreatedResponse(
        String message,
        Integer issueId,
        IssueResponse issue
) {
}
