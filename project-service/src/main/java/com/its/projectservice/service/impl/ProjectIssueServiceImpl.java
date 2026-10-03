package com.its.projectservice.service.impl;

import com.its.projectservice.client.IssueClient;
import com.its.projectservice.dto.IssueDto;
import com.its.projectservice.entity.Project;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.exception.ServiceUnavailableException;
import com.its.projectservice.repository.ProjectRepository;
import com.its.projectservice.service.ProjectIssueService;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Default implementation of {@link ProjectIssueService}.
 * <p>
 * Each method first checks the project exists in this service's database
 * (404 if not), then asks issue-service for its issues.
 */
@Service
public class ProjectIssueServiceImpl implements ProjectIssueService {

    private static final Logger log = LoggerFactory.getLogger(ProjectIssueServiceImpl.class);

    private final ProjectRepository projectRepository;
    private final IssueClient issueClient;

    @Autowired
    public ProjectIssueServiceImpl(ProjectRepository projectRepository, IssueClient issueClient) {
        this.projectRepository = projectRepository;
        this.issueClient = issueClient;
    }

    @Override
    public List<IssueDto> getIssuesByProjectId(Integer projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project with ID " + projectId + " not found");
        }
        return fetchIssues(projectId);
    }

    @Override
    public List<IssueDto> getIssuesByProjectName(String projectName) {
        String name = projectName.trim();
        Project project = projectRepository.findByProjectNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Project named '" + name + "' not found"));
        return fetchIssues(project.getId());
    }

    private List<IssueDto> fetchIssues(Integer projectId) {
        try {
            return issueClient.getIssuesByProject(projectId);
        } catch (FeignException ex) {
            log.warn("Call to issue-service failed: {}", ex.getMessage());
            throw new ServiceUnavailableException("Issue service is not available right now. Please try again later.", ex);
        }
    }
}
