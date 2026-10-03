package com.its.issueservice.service.impl;

import com.its.issueservice.dto.IssueRequest;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.UpdateIssueRequest;
import com.its.issueservice.entity.Issue;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.exception.InvalidRequestException;
import com.its.issueservice.exception.ResourceNotFoundException;
import com.its.issueservice.repository.IssueRepository;
import com.its.issueservice.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/**
 * Default implementation of {@link IssueService}.
 * <p>
 * Checking that the project and the assignee exist (by calling
 * project-service and user-service) is added in Milestone 5.
 */
@Service
public class IssueServiceImpl implements IssueService {

    private final IssueRepository issueRepository;
    private final Clock clock;

    @Autowired
    public IssueServiceImpl(IssueRepository issueRepository, Clock clock) {
        this.issueRepository = issueRepository;
        this.clock = clock;
    }

    @Override
    @Transactional
    public IssueResponse createIssue(IssueRequest request) {
        LocalDate today = LocalDate.now(clock);

        Issue issue = new Issue();
        issue.setSummary(request.summary().trim());
        issue.setType(request.type() != null ? request.type() : IssueType.TASK);
        issue.setProject(request.project());
        issue.setDescription(request.description().trim());
        issue.setPriority(request.priority());
        issue.setAssignee(request.assignee());
        issue.setCreatedBy(request.createdBy());
        issue.setTags(blankToNull(request.tags()));
        issue.setSprint(blankToNull(request.sprint()));
        issue.setStoryPoint(request.storyPoint());
        issue.setStatus(request.status() != null ? request.status() : IssueStatus.TO_DO);
        issue.setCreatedOn(request.createdOn() != null ? request.createdOn() : today);
        issue.setLastUpdated(today);
        issue.setComments(blankToNull(request.comments()));

        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return toResponses(issueRepository.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public IssueResponse getIssueById(Integer issueId) {
        return IssueResponse.from(findIssue(issueId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByProject(Integer projectId) {
        return toResponses(issueRepository.findByProject(projectId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByAssignee(Integer assigneeId) {
        return toResponses(issueRepository.findByAssignee(assigneeId));
    }

    @Override
    @Transactional
    public IssueResponse updateIssue(Integer issueId, UpdateIssueRequest request) {
        Issue issue = findIssue(issueId);

        if (request.summary() != null) {
            issue.setSummary(requireNotBlank(request.summary(), "Summary"));
        }
        if (request.type() != null) {
            issue.setType(request.type());
        }
        if (request.project() != null) {
            issue.setProject(request.project());
        }
        if (request.description() != null) {
            issue.setDescription(requireNotBlank(request.description(), "Description"));
        }
        if (request.priority() != null) {
            issue.setPriority(request.priority());
        }
        if (request.assignee() != null) {
            issue.setAssignee(request.assignee());
        }
        if (request.tags() != null) {
            issue.setTags(blankToNull(request.tags()));
        }
        if (request.sprint() != null) {
            issue.setSprint(blankToNull(request.sprint()));
        }
        if (request.storyPoint() != null) {
            issue.setStoryPoint(request.storyPoint());
        }
        if (request.status() != null) {
            issue.setStatus(request.status());
        }
        if (request.comments() != null) {
            issue.setComments(blankToNull(request.comments()));
        }

        issue.setLastUpdated(LocalDate.now(clock));
        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public IssueResponse updateStatus(Integer issueId, IssueStatus status) {
        Issue issue = findIssue(issueId);
        issue.setStatus(status);
        issue.setLastUpdated(LocalDate.now(clock));
        return IssueResponse.from(issueRepository.save(issue));
    }

    @Override
    @Transactional
    public void deleteIssue(Integer issueId) {
        Issue issue = findIssue(issueId);
        issueRepository.delete(issue);
    }

    // ----------------------------------------------------------------- helpers

    private Issue findIssue(Integer issueId) {
        return issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue with ID " + issueId + " not found"));
    }

    private static List<IssueResponse> toResponses(List<Issue> issues) {
        return issues.stream().map(IssueResponse::from).toList();
    }

    private static String requireNotBlank(String value, String fieldName) {
        if (value.isBlank()) {
            throw new InvalidRequestException(fieldName + " must not be blank");
        }
        return value.trim();
    }

    private static String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
