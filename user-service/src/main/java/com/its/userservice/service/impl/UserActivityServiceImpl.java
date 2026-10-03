package com.its.userservice.service.impl;

import com.its.userservice.client.IssueClient;
import com.its.userservice.client.ProjectClient;
import com.its.userservice.dto.IssueDto;
import com.its.userservice.dto.ProjectDto;
import com.its.userservice.entity.User;
import com.its.userservice.exception.ResourceNotFoundException;
import com.its.userservice.exception.ServiceUnavailableException;
import com.its.userservice.repository.UserRepository;
import com.its.userservice.service.UserActivityService;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Default implementation of {@link UserActivityService}.
 * <p>
 * Each method first checks the user exists in this service's database
 * (404 if not), then asks the other service for the data.
 */
@Service
public class UserActivityServiceImpl implements UserActivityService {

    private static final Logger log = LoggerFactory.getLogger(UserActivityServiceImpl.class);

    private final UserRepository userRepository;
    private final IssueClient issueClient;
    private final ProjectClient projectClient;

    @Autowired
    public UserActivityServiceImpl(UserRepository userRepository, IssueClient issueClient,
                                   ProjectClient projectClient) {
        this.userRepository = userRepository;
        this.issueClient = issueClient;
        this.projectClient = projectClient;
    }

    @Override
    public List<IssueDto> getAssignedIssues(Integer userId) {
        requireUser(userId);
        return fetchIssuesAssignedTo(userId);
    }

    @Override
    public List<IssueDto> getAssignedIssuesByUsername(String username) {
        List<User> users = userRepository.findByNameIgnoreCase(username.trim());
        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No user named '" + username.trim() + "' found");
        }
        // Names are not unique, so collect the issues of every user with this name.
        List<IssueDto> issues = new ArrayList<>();
        for (User user : users) {
            issues.addAll(fetchIssuesAssignedTo(user.getUserId()));
        }
        return issues;
    }

    @Override
    public List<ProjectDto> getOwnedProjects(Integer userId) {
        requireUser(userId);
        return projectClient.getProjectsByOwner(userId);
    }

    // ----------------------------------------------------------------- helpers

    private void requireUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User with ID " + userId + " not found");
        }
    }

    private List<IssueDto> fetchIssuesAssignedTo(Integer userId) {
        try {
            return issueClient.getIssuesByAssignee(userId);
        } catch (FeignException ex) {
            log.warn("Call to issue-service failed: {}", ex.getMessage());
            throw new ServiceUnavailableException("Issue service is not available right now. Please try again later.", ex);
        }
    }
}
