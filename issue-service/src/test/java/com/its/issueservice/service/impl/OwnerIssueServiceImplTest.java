package com.its.issueservice.service.impl;

import com.its.issueservice.client.ProjectClient;
import com.its.issueservice.dto.IssueResponse;
import com.its.issueservice.dto.ProjectDto;
import com.its.issueservice.entity.Issue;
import com.its.issueservice.entity.IssueStatus;
import com.its.issueservice.entity.IssueType;
import com.its.issueservice.entity.Priority;
import com.its.issueservice.exception.ServiceUnavailableException;
import com.its.issueservice.repository.IssueRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link OwnerIssueServiceImpl}. Repository and Feign client are mocked.
 */
@ExtendWith(MockitoExtension.class)
class OwnerIssueServiceImplTest {

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private ProjectClient projectClient;

    private OwnerIssueServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new OwnerIssueServiceImpl(issueRepository, projectClient);
    }

    private static ProjectDto project(int id) {
        return new ProjectDto(id, "Project " + id, 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31));
    }

    private static Issue issue(int id, int projectId) {
        Issue issue = new Issue();
        issue.setId(id);
        issue.setSummary("Issue " + id);
        issue.setType(IssueType.TASK);
        issue.setProject(projectId);
        issue.setDescription("desc");
        issue.setPriority(Priority.LOW);
        issue.setAssignee(2);
        issue.setStatus(IssueStatus.TO_DO);
        issue.setCreatedOn(LocalDate.of(2023, 1, 1));
        issue.setLastUpdated(LocalDate.of(2023, 1, 1));
        return issue;
    }

    @Test
    void getIssuesByOwner_returnsIssuesOfAllOwnedProjects() {
        when(projectClient.getProjectsByOwner(1)).thenReturn(List.of(project(101), project(106)));
        when(issueRepository.findByProjectIn(List.of(101, 106)))
                .thenReturn(List.of(issue(201, 101), issue(211, 106)));

        assertThat(service.getIssuesByOwner(1)).extracting(IssueResponse::id).containsExactly(201, 211);
    }

    @Test
    void getIssuesByOwner_whenUserOwnsNoProjects_returnsEmptyListWithoutQuery() {
        when(projectClient.getProjectsByOwner(9)).thenReturn(List.of());

        assertThat(service.getIssuesByOwner(9)).isEmpty();
        verify(issueRepository, never()).findByProjectIn(any());
    }

    @Test
    void getIssuesByOwner_whenProjectServiceDown_throwsServiceUnavailable() {
        when(projectClient.getProjectsByOwner(1)).thenThrow(FeignException.class);

        assertThatThrownBy(() -> service.getIssuesByOwner(1))
                .isInstanceOf(ServiceUnavailableException.class)
                .hasMessageContaining("Project service is not available");
    }
}
