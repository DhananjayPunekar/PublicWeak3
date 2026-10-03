package com.its.projectservice.service.impl;

import com.its.projectservice.client.IssueClient;
import com.its.projectservice.dto.IssueDto;
import com.its.projectservice.entity.Project;
import com.its.projectservice.exception.ResourceNotFoundException;
import com.its.projectservice.exception.ServiceUnavailableException;
import com.its.projectservice.repository.ProjectRepository;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link ProjectIssueServiceImpl}. Repository and Feign client are mocked.
 */
@ExtendWith(MockitoExtension.class)
class ProjectIssueServiceImplTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private IssueClient issueClient;

    private ProjectIssueServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ProjectIssueServiceImpl(projectRepository, issueClient);
    }

    private static IssueDto issue(int id) {
        return new IssueDto(id, "Issue " + id, "BUG", 101, "desc", "HIGH", 2, null,
                null, null, null, "TO DO", LocalDate.of(2023, 1, 10), LocalDate.of(2023, 1, 15), null);
    }

    @Test
    void getIssuesByProjectId_returnsIssuesFromIssueService() {
        when(projectRepository.existsById(101)).thenReturn(true);
        when(issueClient.getIssuesByProject(101)).thenReturn(List.of(issue(201), issue(202)));

        assertThat(service.getIssuesByProjectId(101)).extracting(IssueDto::id).containsExactly(201, 202);
    }

    @Test
    void getIssuesByProjectId_forUnknownProject_throwsNotFound() {
        when(projectRepository.existsById(999)).thenReturn(false);

        assertThatThrownBy(() -> service.getIssuesByProjectId(999))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Project with ID 999 not found");
        verify(issueClient, never()).getIssuesByProject(any());
    }

    @Test
    void getIssuesByProjectName_looksUpIdThenCallsIssueService() {
        Project alpha = new Project("Project Alpha", 1, LocalDate.of(2023, 1, 1), LocalDate.of(2023, 12, 31));
        alpha.setId(101);
        when(projectRepository.findByProjectNameIgnoreCase("project alpha")).thenReturn(Optional.of(alpha));
        when(issueClient.getIssuesByProject(101)).thenReturn(List.of(issue(201)));

        assertThat(service.getIssuesByProjectName(" project alpha ")).extracting(IssueDto::id).containsExactly(201);
    }

    @Test
    void getIssuesByProjectName_forUnknownName_throwsNotFound() {
        when(projectRepository.findByProjectNameIgnoreCase("Nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getIssuesByProjectName("Nope"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Project named 'Nope' not found");
    }

    @Test
    void getIssuesByProjectId_whenIssueServiceDown_throwsServiceUnavailable() {
        when(projectRepository.existsById(101)).thenReturn(true);
        when(issueClient.getIssuesByProject(101)).thenThrow(FeignException.class);

        assertThatThrownBy(() -> service.getIssuesByProjectId(101))
                .isInstanceOf(ServiceUnavailableException.class);
    }
}
