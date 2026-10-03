package com.its.issueservice.service;

import com.its.issueservice.dto.IssueRequest;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.UpdateIssueRequest;
import com.its.issueservice.entity.IssueStatus;

import java.util.List;

/**
 * Business operations for issues.
 */
public interface IssueService {

    /** Creates an issue; fills in defaults for type, status and dates. */
    IssueResponse createIssue(IssueRequest request);

    List<IssueResponse> getAllIssues();

    IssueResponse getIssueById(Integer issueId);

    /** All issues of a project (empty list if none). */
    List<IssueResponse> getIssuesByProject(Integer projectId);

    /** All issues assigned to a user (empty list if none). */
    List<IssueResponse> getIssuesByAssignee(Integer assigneeId);

    /** Project Owner view: updates only the fields present in the request. */
    IssueResponse updateIssue(Integer issueId, UpdateIssueRequest request);

    /** Assignee view: changes only the status. */
    IssueResponse updateStatus(Integer issueId, IssueStatus status);

    void deleteIssue(Integer issueId);
}
