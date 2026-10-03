package com.its.projectservice.service;

import com.its.projectservice.dto.IssueDto;

import java.util.List;

/**
 * Inter-service operations of the Project Service: the issues of a project,
 * which live in issue-service.
 */
public interface ProjectIssueService {

    /** Issues of the project with this ID (via issue-service, Feign). */
    List<IssueDto> getIssuesByProjectId(Integer projectId);

    /** Issues of the project with this name, case-insensitive (via issue-service, Feign). */
    List<IssueDto> getIssuesByProjectName(String projectName);
}
