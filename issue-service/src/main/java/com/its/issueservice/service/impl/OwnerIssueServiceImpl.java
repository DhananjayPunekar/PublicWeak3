package com.its.issueservice.service.impl;

import com.its.issueservice.client.ProjectClient;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.ProjectDto;
import com.its.issueservice.exception.ServiceUnavailableException;
import com.its.issueservice.repository.IssueRepository;
import com.its.issueservice.service.OwnerIssueService;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Default implementation of {@link OwnerIssueService}:
 * asks project-service for the owner's projects, then loads their issues
 * from this service's database in one query.
 */
@Service
public class OwnerIssueServiceImpl implements OwnerIssueService {

    private static final Logger log = LoggerFactory.getLogger(OwnerIssueServiceImpl.class);

    private final IssueRepository issueRepository;
    private final ProjectClient projectClient;

    @Autowired
    public OwnerIssueServiceImpl(IssueRepository issueRepository, ProjectClient projectClient) {
        this.issueRepository = issueRepository;
        this.projectClient = projectClient;
    }

    @Override
    public List<IssueResponse> getIssuesByOwner(Integer ownerId) {
        List<ProjectDto> projects;
        try {
            projects = projectClient.getProjectsByOwner(ownerId);
        } catch (FeignException ex) {
            log.warn("Call to project-service failed: {}", ex.getMessage());
            throw new ServiceUnavailableException("Project service is not available right now. Please try again later.", ex);
        }

        List<Integer> projectIds = projects.stream().map(ProjectDto::id).toList();
        if (projectIds.isEmpty()) {
            return List.of(); // the user owns no projects
        }
        return issueRepository.findByProjectIn(projectIds).stream()
                .map(IssueResponse::from)
                .toList();
    }
}
