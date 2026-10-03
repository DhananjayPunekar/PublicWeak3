package com.its.issueservice.service;

import com.its.issueservice.dto.IssueResponse;

import java.util.List;

/**
 * Inter-service operation of the Issue Service: issues "owned" by a user,
 * i.e. the issues of every project that user owns. Which projects a user owns
 * is known only to project-service.
 */
public interface OwnerIssueService {

    /** Issues of all projects owned by the user (projects via project-service, Feign). */
    List<IssueResponse> getIssuesByOwner(Integer ownerId);
}
