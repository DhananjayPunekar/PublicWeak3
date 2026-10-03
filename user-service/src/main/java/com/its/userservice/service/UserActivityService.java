package com.its.userservice.service;

import com.its.userservice.dto.IssueDto;
import com.its.userservice.dto.ProjectDto;

import java.util.List;

/**
 * Inter-service operations of the User Service: data about a user that
 * lives in other services (issues in issue-service, projects in project-service).
 */
public interface UserActivityService {

    /** Issues assigned to the user (via issue-service, Feign). */
    List<IssueDto> getAssignedIssues(Integer userId);

    /** Issues assigned to every user with this name (via issue-service, Feign). */
    List<IssueDto> getAssignedIssuesByUsername(String username);

    /** Projects owned by the user (via project-service, RestTemplate). */
    List<ProjectDto> getOwnedProjects(Integer userId);
}
