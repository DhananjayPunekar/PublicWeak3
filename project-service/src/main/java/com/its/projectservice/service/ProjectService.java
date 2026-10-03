package com.its.projectservice.service;

import com.its.projectservice.dto.ProjectRequest;
import com.its.projectservice.dto.ProjectResponse;
import com.its.projectservice.dto.UpdateProjectRequest;

import java.util.List;

/**
 * Business operations for projects.
 */
public interface ProjectService {

    /** Creates a project. Fails if the name is taken or the end date is before the start date. */
    ProjectResponse createProject(ProjectRequest request);

    List<ProjectResponse> getAllProjects();

    ProjectResponse getProjectById(Integer projectId);

    /** All projects owned by the given user (empty list if none). */
    List<ProjectResponse> getProjectsByOwner(Integer ownerId);

    /** Updates only the fields present in the request. */
    ProjectResponse updateProject(Integer projectId, UpdateProjectRequest request);

    void deleteProject(Integer projectId);
}
